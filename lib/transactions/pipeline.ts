import { prisma } from '../db/prisma';
import {
  buildCanonicalString,
  calculateSha256,
  generateSecureNonce,
  generateTransactionId,
} from '../crypto/hashing';
import {
  signTransaction,
  verifyTransactionSignature,
} from '../crypto/signatures';
import { decryptPrivateKey } from '../crypto/key-management';
import {
  encryptSensitiveData,
  decryptSensitiveData,
} from '../crypto/encryption';

export interface CreateTransactionParams {
  senderId: string;
  receiverId: string;
  amount: number;
  note?: string;
}

export interface VerificationStepResult {
  step: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  details: string;
  data?: any;
}

export interface FullVerificationReport {
  txId: string;
  senderName: string;
  receiverName: string;
  amount: number;
  timestamp: string;
  canonicalString: string;
  integrity: {
    algorithm: 'SHA-256';
    originalHash: string;
    recomputedHash: string;
    matches: boolean;
    status: 'PASSED' | 'FAILED';
  };
  signature: {
    algorithm: 'Ed25519';
    signature: string;
    publicKeyFingerprint: string;
    isValid: boolean;
    status: 'PASSED' | 'FAILED';
  };
  replayProtection: {
    nonce: string;
    isDuplicateNonce: boolean;
    isProcessedTxId: boolean;
    status: 'PASSED' | 'FAILED';
  };
  confidentiality?: {
    algorithm: 'AES-256-GCM';
    hasEncryptedMemo: boolean;
    ciphertext?: string;
    iv?: string;
    authTag?: string;
    decryptedMemo?: string;
  };
  finalResult: 'ACCEPTED' | 'REJECTED' | 'TAMPERED' | 'REPLAY_ATTEMPT';
  summaryMessage: string;
}

/**
 * Executes a full cryptographic transaction flow with atomic database updates.
 */
export async function processSecureTransaction(params: CreateTransactionParams) {
  const { senderId, receiverId, amount, note } = params;

  if (amount <= 0) {
    throw new Error('Transaction amount must be strictly positive.');
  }

  if (senderId === receiverId) {
    throw new Error('Self-transfers are not permitted.');
  }

  // 1. Fetch sender and receiver with wallets & keys
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    include: { wallet: true, keyStore: true, publicKeys: { where: { isRevoked: false } } },
  });

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    include: { wallet: true },
  });

  if (!sender || !sender.wallet) {
    throw new Error('Sender wallet does not exist.');
  }

  if (!receiver || !receiver.wallet) {
    throw new Error('Receiver wallet does not exist.');
  }

  if (sender.wallet.balance < amount) {
    throw new Error(`Insufficient balance: Available ₹${sender.wallet.balance.toFixed(2)}, required ₹${amount.toFixed(2)}.`);
  }

  if (!sender.keyStore) {
    throw new Error('Sender cryptographic key store not found.');
  }

  const senderPublicKey = sender.publicKeys[0];
  if (!senderPublicKey) {
    throw new Error('Sender has no active public key registered.');
  }

  // 2. Generate Transaction Identifiers & Fresh 128-bit Nonce
  const txId = generateTransactionId();
  const nonce = generateSecureNonce();
  const timestamp = new Date().toISOString();

  // 3. Build Canonical Representation
  const canonicalString = buildCanonicalString({
    txId,
    senderId,
    receiverId,
    amount,
    timestamp,
    nonce,
  });

  // 4. Calculate SHA-256 Digest
  const transactionHash = calculateSha256(canonicalString);

  // 5. Decrypt Sender's Private Key in memory and sign transaction hash
  const senderPrivateKeyPem = decryptPrivateKey(
    sender.keyStore.encryptedPrivateKey,
    sender.keyStore.iv,
    sender.keyStore.authTag
  );
  const signature = signTransaction(senderPrivateKeyPem, transactionHash);

  // 6. Encrypt sensitive memo using AES-256-GCM if present
  let encryptedNoteCiphertext: string | null = null;
  let encryptedNoteIv: string | null = null;
  let encryptedNoteTag: string | null = null;

  if (note && note.trim().length > 0) {
    const enc = encryptSensitiveData(note.trim());
    encryptedNoteCiphertext = enc.ciphertext;
    encryptedNoteIv = enc.iv;
    encryptedNoteTag = enc.authTag;
  }

  // 7. Verify Signature & Integrity prior to persistence
  const isSignatureValid = verifyTransactionSignature(
    senderPublicKey.publicKeyPem,
    transactionHash,
    signature
  );

  if (!isSignatureValid) {
    await prisma.auditLog.create({
      data: {
        userId: senderId,
        eventType: 'SIGNATURE_FAILURE',
        details: `Signature verification failed during transaction composition for ${txId}`,
      },
    });
    throw new Error('Cryptographic signature verification failed.');
  }

  // 8. Atomic Database Execution: Update Balances + Save Transaction + Save Nonce + Audit Log
  const result = await prisma.$transaction(async (tx) => {
    // Deduct sender balance
    const updatedSenderWallet = await tx.wallet.update({
      where: { userId: senderId },
      data: { balance: { decrement: amount } },
    });

    // Credit receiver balance
    const updatedReceiverWallet = await tx.wallet.update({
      where: { userId: receiverId },
      data: { balance: { increment: amount } },
    });

    // Check negative balance invariant
    if (updatedSenderWallet.balance < 0) {
      throw new Error('Transaction aborted: Balance invariant violated (negative balance).');
    }

    // Record consumed nonce for replay protection
    await tx.processedNonce.create({
      data: {
        nonce,
        txId,
      },
    });

    // Create transaction record
    const createdTx = await tx.transaction.create({
      data: {
        txId,
        senderId,
        receiverId,
        amount,
        timestamp,
        nonce,
        canonicalPayload: canonicalString,
        transactionHash,
        signature,
        signatureAlgorithm: 'Ed25519',
        encryptedNote: encryptedNoteCiphertext,
        encryptedNoteIv: encryptedNoteIv,
        encryptedNoteTag: encryptedNoteTag,
        status: 'ACCEPTED',
        statusReason: 'Signature valid, integrity verified, fresh nonce, balance confirmed.',
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    // Record audit event
    await tx.auditLog.create({
      data: {
        userId: senderId,
        eventType: 'TRANSACTION_VERIFIED',
        details: `Transaction ${txId} accepted: ₹${amount.toFixed(2)} transferred to ${receiver.name}. SHA-256: ${transactionHash.slice(0, 16)}...`,
      },
    });

    return {
      transaction: createdTx,
      senderWallet: updatedSenderWallet,
      receiverWallet: updatedReceiverWallet,
    };
  });

  return result;
}

/**
 * Runs a complete cryptographic verification pipeline on any transaction record,
 * returning full details of every security check for the verification UI.
 */
export async function verifyTransactionById(txId: string): Promise<FullVerificationReport> {
  const tx = await prisma.transaction.findUnique({
    where: { txId },
    include: {
      sender: {
        include: { publicKeys: { where: { isRevoked: false } } },
      },
      receiver: true,
    },
  });

  if (!tx) {
    throw new Error(`Transaction with ID ${txId} not found.`);
  }

  // 1. Recompute canonical string
  const recomputedCanonical = buildCanonicalString({
    txId: tx.txId,
    senderId: tx.senderId,
    receiverId: tx.receiverId,
    amount: tx.amount,
    timestamp: tx.timestamp,
    nonce: tx.nonce,
  });

  // 2. Recompute SHA-256 digest
  const recomputedHash = calculateSha256(recomputedCanonical);
  const isHashMatch = recomputedHash === tx.transactionHash;

  // 3. Verify Ed25519 Digital Signature
  const senderPublicKey = tx.sender.publicKeys[0];
  let isSignatureValid = false;
  let fingerprint = 'N/A';

  if (senderPublicKey) {
    fingerprint = senderPublicKey.fingerprint;
    // Signature was signed over the transactionHash
    isSignatureValid = verifyTransactionSignature(
      senderPublicKey.publicKeyPem,
      recomputedHash,
      tx.signature
    );
  }

  // 4. Replay Check: Nonce exists in ProcessedNonce table
  const existingNonceRecord = await prisma.processedNonce.findUnique({
    where: { nonce: tx.nonce },
  });

  // If this transaction was already accepted, its nonce should belong to this exact txId
  const isReplay = existingNonceRecord ? existingNonceRecord.txId !== tx.txId : false;

  // 5. Decrypt Memo if present
  let decryptedMemo: string | undefined = undefined;
  if (tx.encryptedNote && tx.encryptedNoteIv && tx.encryptedNoteTag) {
    const dec = decryptSensitiveData(tx.encryptedNote, tx.encryptedNoteIv, tx.encryptedNoteTag);
    if (dec.success) {
      decryptedMemo = dec.plaintext;
    }
  }

  // Determine final result
  let finalResult: 'ACCEPTED' | 'REJECTED' | 'TAMPERED' | 'REPLAY_ATTEMPT' = 'ACCEPTED';
  let summaryMessage = 'All cryptographic checks passed: Integrity verified, Ed25519 signature valid, replay protection satisfied.';

  if (!isHashMatch || !isSignatureValid) {
    finalResult = 'TAMPERED';
    summaryMessage = 'Integrity violation: Transaction data altered after signing. Digital signature validation failed.';
  } else if (isReplay) {
    finalResult = 'REPLAY_ATTEMPT';
    summaryMessage = 'Replay attack detected: Nonce has already been consumed by another transaction.';
  }

  return {
    txId: tx.txId,
    senderName: tx.sender.name,
    receiverName: tx.receiver.name,
    amount: tx.amount,
    timestamp: tx.timestamp,
    canonicalString: recomputedCanonical,
    integrity: {
      algorithm: 'SHA-256',
      originalHash: tx.transactionHash,
      recomputedHash,
      matches: isHashMatch,
      status: isHashMatch ? 'PASSED' : 'FAILED',
    },
    signature: {
      algorithm: 'Ed25519',
      signature: tx.signature,
      publicKeyFingerprint: fingerprint,
      isValid: isSignatureValid,
      status: isSignatureValid ? 'PASSED' : 'FAILED',
    },
    replayProtection: {
      nonce: tx.nonce,
      isDuplicateNonce: isReplay,
      isProcessedTxId: true,
      status: !isReplay ? 'PASSED' : 'FAILED',
    },
    confidentiality: {
      algorithm: 'AES-256-GCM',
      hasEncryptedMemo: !!tx.encryptedNote,
      ciphertext: tx.encryptedNote || undefined,
      iv: tx.encryptedNoteIv || undefined,
      authTag: tx.encryptedNoteTag || undefined,
      decryptedMemo,
    },
    finalResult,
    summaryMessage,
  };
}

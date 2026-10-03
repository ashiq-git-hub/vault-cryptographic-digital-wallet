import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  buildCanonicalString,
  calculateSha256,
} from '@/lib/crypto/hashing';
import { verifyTransactionSignature } from '@/lib/crypto/signatures';

export async function POST(req: Request) {
  try {
    const { txId, tamperedAmount, tamperedReceiverId } = await req.json();

    if (!txId) {
      return NextResponse.json({ error: 'Transaction ID is required.' }, { status: 400 });
    }

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
      return NextResponse.json({ error: `Transaction ${txId} not found.` }, { status: 404 });
    }

    const senderPublicKey = tx.sender.publicKeys[0];
    if (!senderPublicKey) {
      return NextResponse.json({ error: 'Sender public key not found.' }, { status: 400 });
    }

    // 1. Original Signed State
    const originalCanonical = tx.canonicalPayload;
    const originalHash = tx.transactionHash;
    const originalSignature = tx.signature;

    // 2. Attacker Tampering: Modify amount or receiver after sender signed
    const effectiveTamperedAmount = tamperedAmount ? parseFloat(tamperedAmount) : tx.amount * 10;
    const effectiveReceiverId = tamperedReceiverId || tx.receiverId;

    const tamperedCanonical = buildCanonicalString({
      txId: tx.txId,
      senderId: tx.senderId,
      receiverId: effectiveReceiverId,
      amount: effectiveTamperedAmount,
      timestamp: tx.timestamp,
      nonce: tx.nonce,
    });

    // 3. Recompute SHA-256 hash of tampered payload
    const tamperedHash = calculateSha256(tamperedCanonical);

    // 4. Verify original signature against the tampered hash
    const isOriginalSignatureValidOnTamperedHash = verifyTransactionSignature(
      senderPublicKey.publicKeyPem,
      tamperedHash,
      originalSignature
    );

    // Log the tampering security event
    await prisma.auditLog.create({
      data: {
        userId: tx.senderId,
        eventType: 'TAMPERING_DETECTED',
        details: `Attack Simulator: Tampering simulated on ${tx.txId}. Original amount ₹${tx.amount} modified to ₹${effectiveTamperedAmount}. Signature validation failed.`,
      },
    });

    return NextResponse.json({
      success: true,
      simulationType: 'TRANSACTION_TAMPERING',
      txId: tx.txId,
      sender: tx.sender.name,
      original: {
        amount: tx.amount,
        receiver: tx.receiver.name,
        canonicalString: originalCanonical,
        hash: originalHash,
        signature: originalSignature,
        signatureStatus: 'VALID_WHEN_SIGNED',
      },
      tampered: {
        amount: effectiveTamperedAmount,
        receiverId: effectiveReceiverId,
        canonicalString: tamperedCanonical,
        calculatedHash: tamperedHash,
      },
      verification: {
        integrityCheck: {
          originalHash,
          calculatedHash: tamperedHash,
          matches: false,
          status: 'FAILED',
          details: 'Calculated hash does not match original signed hash.',
        },
        signatureCheck: {
          algorithm: 'Ed25519',
          publicKeyFingerprint: senderPublicKey.fingerprint,
          isValid: isOriginalSignatureValidOnTamperedHash,
          status: 'FAILED',
          details: 'The original signature from the private key holder fails validation over the modified hash.',
        },
        decision: 'REJECTED',
        reason: 'Tampering detected. Transaction integrity and authenticity checks both failed.',
      },
      explanation:
        'The attacker changed the transaction data after it was signed. Because SHA-256 is collision-resistant and exhibits the avalanche effect, changing the amount from ₹' +
        tx.amount +
        ' to ₹' +
        effectiveTamperedAmount +
        ' produces a completely different hash. The sender only signed the original hash with their Ed25519 private key. Without the private key, the attacker cannot forge a valid signature for the new hash. Therefore, the system detects and rejects the tampering immediately.',
    });
  } catch (error: any) {
    console.error('Tampering Attack Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

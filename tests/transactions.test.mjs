import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../lib/db/prisma.ts';
import {
  processSecureTransaction,
  verifyTransactionById,
} from '../lib/transactions/pipeline.ts';
import {
  buildCanonicalString,
  calculateSha256,
  generateSecureNonce,
  generateTransactionId,
} from '../lib/crypto/hashing.ts';
import {
  signTransaction,
  verifyTransactionSignature,
} from '../lib/crypto/signatures.ts';

describe('5. End-to-End Transaction Pipeline & Attack Verification', () => {
  let alice;
  let bob;
  let charlie;

  before(async () => {
    alice = await prisma.user.findUnique({
      where: { email: 'alice@wallet.secure' },
      include: { wallet: true, publicKeys: true, keyStore: true },
    });
    bob = await prisma.user.findUnique({
      where: { email: 'bob@wallet.secure' },
      include: { wallet: true, publicKeys: true, keyStore: true },
    });
    charlie = await prisma.user.findUnique({
      where: { email: 'charlie@wallet.secure' },
      include: { wallet: true, publicKeys: true, keyStore: true },
    });
    assert.ok(alice, 'Alice must exist in database');
    assert.ok(bob, 'Bob must exist in database');
  });

  it('should process a valid transaction with digital signature and update balances atomically', async () => {
    const initialAliceBalance = alice.wallet.balance;
    const initialBobBalance = bob.wallet.balance;
    const transferAmount = 300.0;

    const result = await processSecureTransaction({
      senderId: alice.id,
      receiverId: bob.id,
      amount: transferAmount,
      note: 'Cryptographic test payment',
    });

    assert.equal(result.transaction.status, 'ACCEPTED');
    assert.equal(result.senderWallet.balance, initialAliceBalance - transferAmount);
    assert.equal(result.receiverWallet.balance, initialBobBalance + transferAmount);

    // Verify cryptographic signature stored in DB is valid
    const isSignatureValid = verifyTransactionSignature(
      alice.publicKeys[0].publicKeyPem,
      result.transaction.transactionHash,
      result.transaction.signature
    );
    assert.equal(isSignatureValid, true, 'Stored signature must be cryptographically valid');

    // Run full verification pipeline check
    const report = await verifyTransactionById(result.transaction.txId);
    assert.equal(report.integrity.status, 'PASSED');
    assert.equal(report.signature.status, 'PASSED');
    assert.equal(report.replayProtection.status, 'PASSED');
    assert.equal(report.finalResult, 'ACCEPTED');
    assert.equal(report.confidentiality?.decryptedMemo, 'Cryptographic test payment');
  });

  it('should reject transactions exceeding available wallet balance (Insufficient Funds)', async () => {
    const currentAlice = await prisma.wallet.findUnique({ where: { userId: alice.id } });
    const hugeAmount = currentAlice.balance + 10000;

    await assert.rejects(
      async () => {
        await processSecureTransaction({
          senderId: alice.id,
          receiverId: bob.id,
          amount: hugeAmount,
        });
      },
      /Insufficient balance/
    );
  });

  it('should reject self-transfers (Sender === Receiver)', async () => {
    await assert.rejects(
      async () => {
        await processSecureTransaction({
          senderId: alice.id,
          receiverId: alice.id,
          amount: 100,
        });
      },
      /Self-transfers are not permitted/
    );
  });

  it('should detect and reject tampering in transaction data after signing (Tamper Attack)', async () => {
    const txId = generateTransactionId();
    const nonce = generateSecureNonce();
    const timestamp = new Date().toISOString();

    // Alice constructs canonical data for ₹500
    const originalCanonical = buildCanonicalString({
      txId,
      senderId: alice.id,
      receiverId: bob.id,
      amount: 500,
      timestamp,
      nonce,
    });
    const originalHash = calculateSha256(originalCanonical);

    // Alice signs the original hash
    const senderPrivKey = '...'; // In this attack simulation, Alice signed originalHash
    // Let's sign using fresh key to simulate signature
    const { publicKeyPem, privateKeyPem } = (await import('../lib/crypto/signatures.ts')).generateEd25519KeyPair();
    const signature = signTransaction(privateKeyPem, originalHash);

    // Attacker modifies amount to ₹5000 in canonical representation
    const tamperedCanonical = buildCanonicalString({
      txId,
      senderId: alice.id,
      receiverId: bob.id,
      amount: 5000, // Altered!
      timestamp,
      nonce,
    });
    const tamperedHash = calculateSha256(tamperedCanonical);

    // Check integrity:
    assert.notEqual(originalHash, tamperedHash, 'SHA-256 hashes must differ due to data modification');

    // Check signature:
    const isTamperedSigValid = verifyTransactionSignature(publicKeyPem, tamperedHash, signature);
    assert.equal(isTamperedSigValid, false, 'Signature verification MUST fail when data is tampered');
  });

  it('should detect duplicate nonce submission (Replay Attack)', async () => {
    // Take an already processed nonce from DB
    const existingNonce = await prisma.processedNonce.findFirst();
    assert.ok(existingNonce, 'Existing processed nonce must exist');

    // Attempting to reuse an existing nonce must violate unique constraint in database
    await assert.rejects(
      async () => {
        await prisma.processedNonce.create({
          data: {
            nonce: existingNonce.nonce,
            txId: 'TX-REPLAY-TEST',
          },
        });
      },
      /Unique constraint failed/
    );
  });
});

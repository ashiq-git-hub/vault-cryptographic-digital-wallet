import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCanonicalString,
  calculateSha256,
  generateSecureNonce,
  generateTransactionId,
  calculateAvalancheEffect,
} from '../lib/crypto/hashing.ts';
import {
  generateEd25519KeyPair,
  signTransaction,
  verifyTransactionSignature,
  computePublicKeyFingerprint,
} from '../lib/crypto/signatures.ts';
import {
  encryptSensitiveData,
  decryptSensitiveData,
} from '../lib/crypto/encryption.ts';
import {
  hashPassword,
  verifyPassword,
} from '../lib/crypto/password.ts';

describe('1. Hashing & Canonicalization (SHA-256)', () => {
  it('should produce identical SHA-256 hash for identical input', () => {
    const input = 'Alice sends ₹500 to Bob';
    const hash1 = calculateSha256(input);
    const hash2 = calculateSha256(input);
    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64, 'SHA-256 must be 64 hex characters (256 bits)');
  });

  it('should produce distinct hashes for different inputs (Collision Resistance)', () => {
    const hashA = calculateSha256('Transfer ₹500');
    const hashB = calculateSha256('Transfer ₹501');
    assert.notEqual(hashA, hashB);
  });

  it('should create deterministic canonical string irrespective of parameter input sequence', () => {
    const params = {
      txId: 'TX-1001',
      senderId: 'USER-ALICE',
      receiverId: 'USER-BOB',
      amount: 500.0,
      timestamp: '2026-10-02T12:00:00Z',
      nonce: 'a1b2c3d4e5f6',
    };

    const canonical1 = buildCanonicalString(params);
    const canonical2 = buildCanonicalString({
      nonce: 'a1b2c3d4e5f6',
      amount: 500,
      txId: 'TX-1001',
      timestamp: '2026-10-02T12:00:00Z',
      senderId: 'USER-ALICE',
      receiverId: 'USER-BOB',
    });

    assert.equal(canonical1, canonical2);
    assert.equal(calculateSha256(canonical1), calculateSha256(canonical2));
  });

  it('should demonstrate the Avalanche Effect with ~50% flipped bits for a 1-character change', () => {
    const result = calculateAvalancheEffect('Hello World', 'Hello world');
    assert.notEqual(result.hash1, result.hash2);
    assert.equal(result.totalBits, 256);
    // Cryptographic avalanche factor should flip substantial number of bits (typically > 30% and < 70%)
    assert.ok(result.flippedBits > 75, `Expected > 75 flipped bits, got ${result.flippedBits}`);
    assert.ok(result.flipPercentage >= 30, `Expected > 30% flip rate, got ${result.flipPercentage}%`);
  });
});

describe('2. Digital Signatures (Ed25519)', () => {
  it('should generate valid Ed25519 keypair and calculate public key fingerprint', () => {
    const keypair = generateEd25519KeyPair();
    assert.ok(keypair.publicKeyPem.includes('-----BEGIN PUBLIC KEY-----'));
    assert.ok(keypair.privateKeyPem.includes('-----BEGIN PRIVATE KEY-----'));
    assert.ok(keypair.fingerprint.includes(':'));
  });

  it('should sign transaction hash and successfully verify with corresponding public key', () => {
    const keypair = generateEd25519KeyPair();
    const txHash = calculateSha256('amount=500.00|nonce=123|receiver_id=BOB|sender_id=ALICE|timestamp=2026|tx_id=TX-1');

    const signature = signTransaction(keypair.privateKeyPem, txHash);
    assert.ok(signature.length > 0);

    const isValid = verifyTransactionSignature(keypair.publicKeyPem, txHash, signature);
    assert.equal(isValid, true, 'Digital signature must verify as true for genuine message and key');
  });

  it('should reject signature if transaction data / hash was tampered with (Tamper Detection)', () => {
    const aliceKeys = generateEd25519KeyPair();
    const originalHash = calculateSha256('amount=500.00|tx_id=TX-1');
    const signature = signTransaction(aliceKeys.privateKeyPem, originalHash);

    // Attacker modifies amount from ₹500 to ₹5000
    const tamperedHash = calculateSha256('amount=5000.00|tx_id=TX-1');
    const isValid = verifyTransactionSignature(aliceKeys.publicKeyPem, tamperedHash, signature);

    assert.equal(isValid, false, 'Tampered transaction hash MUST fail signature verification');
  });

  it('should reject signature if verified with wrong public key (Impersonation Defense)', () => {
    const aliceKeys = generateEd25519KeyPair();
    const eveKeys = generateEd25519KeyPair();
    const txHash = calculateSha256('amount=500.00|tx_id=TX-1');

    const signature = signTransaction(aliceKeys.privateKeyPem, txHash);
    const isValid = verifyTransactionSignature(eveKeys.publicKeyPem, txHash, signature);

    assert.equal(isValid, false, 'Signature cannot be validated with another user public key');
  });
});

describe('3. Symmetric Authenticated Encryption (AES-256-GCM)', () => {
  it('should encrypt plaintext and correctly decrypt back to original text', () => {
    const sensitiveMemo = 'Confidential simulated memo: Invoice #99281';
    const encrypted = encryptSensitiveData(sensitiveMemo);

    assert.ok(encrypted.ciphertext.length > 0);
    assert.equal(encrypted.iv.length, 24, 'IV should be 12 bytes = 24 hex characters');
    assert.equal(encrypted.authTag.length, 32, 'Auth tag should be 16 bytes = 32 hex characters');

    const decrypted = decryptSensitiveData(encrypted.ciphertext, encrypted.iv, encrypted.authTag);
    assert.equal(decrypted.success, true);
    assert.equal(decrypted.plaintext, sensitiveMemo);
  });

  it('should fail decryption if ciphertext has been tampered with (Authenticated Tag Check)', () => {
    const originalMessage = 'Secret payment note';
    const encrypted = encryptSensitiveData(originalMessage);

    // Attacker tampers with the first character of ciphertext
    const tamperedCiphertext =
      (encrypted.ciphertext[0] === 'a' ? 'b' : 'a') + encrypted.ciphertext.slice(1);

    const decrypted = decryptSensitiveData(tamperedCiphertext, encrypted.iv, encrypted.authTag);
    assert.equal(decrypted.success, false, 'Tampered ciphertext must fail authentication check');
    assert.ok(decrypted.error?.includes('Authentication Tag Verification Failed'));
  });

  it('should fail decryption if authentication tag is corrupted', () => {
    const originalMessage = 'Secret payment note';
    const encrypted = encryptSensitiveData(originalMessage);

    // Attacker modifies the auth tag
    const corruptedTag =
      (encrypted.authTag[0] === '0' ? '1' : '0') + encrypted.authTag.slice(1);

    const decrypted = decryptSensitiveData(encrypted.ciphertext, encrypted.iv, corruptedTag);
    assert.equal(decrypted.success, false);
  });
});

describe('4. Password Hashing (PBKDF2-HMAC-SHA512)', () => {
  it('should hash password with random salt and verify correctly', () => {
    const password = 'AliceSecurePassword!2026';
    const hashResult = hashPassword(password);

    assert.equal(hashResult.algorithm, 'PBKDF2-HMAC-SHA512');
    assert.equal(hashResult.iterations, 100000);
    assert.equal(hashResult.hash.length, 128, 'SHA-512 derived key is 64 bytes = 128 hex chars');

    const isValid = verifyPassword(password, hashResult.hash, hashResult.salt);
    assert.equal(isValid, true);

    const isWrongValid = verifyPassword('WrongPassword!', hashResult.hash, hashResult.salt);
    assert.equal(isWrongValid, false);
  });
});

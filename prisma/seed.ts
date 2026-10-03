import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/crypto/password';
import { generateEd25519KeyPair, signTransaction } from '../lib/crypto/signatures';
import { encryptPrivateKey } from '../lib/crypto/key-management';
import { encryptSensitiveData } from '../lib/crypto/encryption';
import {
  buildCanonicalString,
  calculateSha256,
  generateSecureNonce,
} from '../lib/crypto/hashing';

const prisma = new PrismaClient();

export async function runSeed() {
  console.log('Seeding Cryptographic Digital Wallet database...');

  // Clear existing demo records
  await prisma.auditLog.deleteMany();
  await prisma.processedNonce.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.keyStore.deleteMany();
  await prisma.publicKey.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  const demoPassword = 'Password123!';

  // Users data to seed
  const usersToSeed = [
    {
      name: 'Alice Smith',
      email: 'alice@wallet.secure',
      balance: 10000.0,
    },
    {
      name: 'Bob Jones',
      email: 'bob@wallet.secure',
      balance: 7500.0,
    },
    {
      name: 'Charlie Brown',
      email: 'charlie@wallet.secure',
      balance: 5000.0,
    },
  ];

  const createdUsers: Record<string, { user: any; keypair: any }> = {};

  for (const item of usersToSeed) {
    const { hash, salt } = hashPassword(demoPassword);
    const keypair = generateEd25519KeyPair();
    const encryptedKey = encryptPrivateKey(keypair.privateKeyPem);

    const user = await prisma.user.create({
      data: {
        name: item.name,
        email: item.email,
        passwordHash: hash,
        passwordSalt: salt,
        wallet: {
          create: {
            balance: item.balance,
            currency: 'INR',
          },
        },
        publicKeys: {
          create: {
            algorithm: 'Ed25519',
            publicKeyPem: keypair.publicKeyPem,
            fingerprint: keypair.fingerprint,
          },
        },
        keyStore: {
          create: {
            encryptedPrivateKey: encryptedKey.ciphertext,
            iv: encryptedKey.iv,
            authTag: encryptedKey.authTag,
          },
        },
        auditLogs: {
          create: {
            eventType: 'KEY_GENERATED',
            details: `Ed25519 keypair initialized. Public Key Fingerprint: ${keypair.fingerprint}`,
          },
        },
      },
    });

    createdUsers[item.name.split(' ')[0].toLowerCase()] = { user, keypair };
    console.log(`Created user ${item.name} with balance ₹${item.balance.toLocaleString()} and fingerprint ${keypair.fingerprint.slice(0, 17)}...`);
  }

  const alice = createdUsers['alice'];
  const bob = createdUsers['bob'];
  const charlie = createdUsers['charlie'];

  // Seed Transaction 1: Alice -> Bob ₹500 (Verified & Accepted)
  const tx1Id = 'TX-8F29A1';
  const tx1Nonce = generateSecureNonce();
  const tx1Timestamp = new Date(Date.now() - 3600000 * 2).toISOString();
  const tx1Canonical = buildCanonicalString({
    txId: tx1Id,
    senderId: alice.user.id,
    receiverId: bob.user.id,
    amount: 500.0,
    timestamp: tx1Timestamp,
    nonce: tx1Nonce,
  });
  const tx1Hash = calculateSha256(tx1Canonical);
  const tx1Signature = signTransaction(alice.keypair.privateKeyPem, tx1Hash);
  const tx1EncryptedNote = encryptSensitiveData('Payment for textbook chapter');

  await prisma.transaction.create({
    data: {
      txId: tx1Id,
      senderId: alice.user.id,
      receiverId: bob.user.id,
      amount: 500.0,
      timestamp: tx1Timestamp,
      nonce: tx1Nonce,
      canonicalPayload: tx1Canonical,
      transactionHash: tx1Hash,
      signature: tx1Signature,
      signatureAlgorithm: 'Ed25519',
      encryptedNote: tx1EncryptedNote.ciphertext,
      encryptedNoteIv: tx1EncryptedNote.iv,
      encryptedNoteTag: tx1EncryptedNote.authTag,
      status: 'ACCEPTED',
      statusReason: 'Signature valid, integrity verified, fresh nonce, balance confirmed.',
    },
  });

  await prisma.processedNonce.create({
    data: {
      nonce: tx1Nonce,
      txId: tx1Id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: alice.user.id,
      eventType: 'TRANSACTION_VERIFIED',
      details: `Transaction ${tx1Id} verified (SHA-256: ${tx1Hash.slice(0, 16)}..., Ed25519 signature valid)`,
    },
  });

  // Seed Transaction 2: Bob -> Alice ₹200 (Verified & Accepted)
  const tx2Id = 'TX-3B10C4';
  const tx2Nonce = generateSecureNonce();
  const tx2Timestamp = new Date(Date.now() - 1800000).toISOString();
  const tx2Canonical = buildCanonicalString({
    txId: tx2Id,
    senderId: bob.user.id,
    receiverId: alice.user.id,
    amount: 200.0,
    timestamp: tx2Timestamp,
    nonce: tx2Nonce,
  });
  const tx2Hash = calculateSha256(tx2Canonical);
  const tx2Signature = signTransaction(bob.keypair.privateKeyPem, tx2Hash);

  await prisma.transaction.create({
    data: {
      txId: tx2Id,
      senderId: bob.user.id,
      receiverId: alice.user.id,
      amount: 200.0,
      timestamp: tx2Timestamp,
      nonce: tx2Nonce,
      canonicalPayload: tx2Canonical,
      transactionHash: tx2Hash,
      signature: tx2Signature,
      signatureAlgorithm: 'Ed25519',
      status: 'ACCEPTED',
      statusReason: 'Signature valid, integrity verified, fresh nonce, balance confirmed.',
    },
  });

  await prisma.processedNonce.create({
    data: {
      nonce: tx2Nonce,
      txId: tx2Id,
    },
  });

  // Seed Transaction 3: Demonstration Tampered Transaction (Alice -> Charlie ₹1000 tampered)
  const tx3Id = 'TX-73AA1F';
  const tx3Nonce = generateSecureNonce();
  const tx3Timestamp = new Date(Date.now() - 600000).toISOString();
  // Alice originally created it for 1000
  const tx3OriginalCanonical = buildCanonicalString({
    txId: tx3Id,
    senderId: alice.user.id,
    receiverId: charlie.user.id,
    amount: 1000.0,
    timestamp: tx3Timestamp,
    nonce: tx3Nonce,
  });
  const tx3OriginalHash = calculateSha256(tx3OriginalCanonical);
  const tx3OriginalSignature = signTransaction(alice.keypair.privateKeyPem, tx3OriginalHash);

  // But attacker tampered amount to 5000 in transit
  const tx3TamperedCanonical = buildCanonicalString({
    txId: tx3Id,
    senderId: alice.user.id,
    receiverId: charlie.user.id,
    amount: 5000.0, // Tampered!
    timestamp: tx3Timestamp,
    nonce: tx3Nonce,
  });
  const tx3TamperedHash = calculateSha256(tx3TamperedCanonical);

  await prisma.transaction.create({
    data: {
      txId: tx3Id,
      senderId: alice.user.id,
      receiverId: charlie.user.id,
      amount: 5000.0, // Tampered value in DB to demonstrate failed verification
      timestamp: tx3Timestamp,
      nonce: tx3Nonce,
      canonicalPayload: tx3TamperedCanonical,
      transactionHash: tx3TamperedHash,
      signature: tx3OriginalSignature, // Original signature over 1000
      signatureAlgorithm: 'Ed25519',
      status: 'TAMPERED',
      statusReason: 'Integrity verification failed: Transaction hash does not match digital signature.',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: alice.user.id,
      eventType: 'TAMPERING_DETECTED',
      details: `CRITICAL: Tampering detected on ${tx3Id}. Signature invalid for modified payload.`,
    },
  });

  console.log('Seed completed successfully!');
}

import { fileURLToPath } from 'node:url';

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  runSeed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

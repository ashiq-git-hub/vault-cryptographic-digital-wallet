import { NextResponse } from 'next/server';
import { calculateSha256 } from '@/lib/crypto/hashing';
import {
  generateEd25519KeyPair,
  signTransaction,
  verifyTransactionSignature,
} from '@/lib/crypto/signatures';

export async function POST(req: Request) {
  try {
    const { message, tamperedMessage } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required for signature lab.' }, { status: 400 });
    }

    // Generate ephemeral educational Ed25519 keypair for the lab
    const keypair = generateEd25519KeyPair();

    // Hash the original message with SHA-256
    const messageHash = calculateSha256(message);

    // Sign the hash with Ed25519 private key
    const signature = signTransaction(keypair.privateKeyPem, messageHash);

    // Verify original
    const isOriginalValid = verifyTransactionSignature(
      keypair.publicKeyPem,
      messageHash,
      signature
    );

    let tamperingResult = null;
    if (tamperedMessage !== undefined && tamperedMessage !== null) {
      const tamperedHash = calculateSha256(tamperedMessage);
      const isTamperedValid = verifyTransactionSignature(
        keypair.publicKeyPem,
        tamperedHash,
        signature
      );

      tamperingResult = {
        tamperedMessage,
        tamperedHash,
        isTamperedValid,
        status: isTamperedValid ? 'PASSED' : 'REJECTED',
        explanation: isTamperedValid
          ? 'Unexpected pass'
          : 'The signature verification failed because the cryptographic hash of the modified message does not match what the private key signed.',
      };
    }

    return NextResponse.json({
      originalMessage: message,
      messageHash,
      signature,
      signatureAlgorithm: 'Ed25519',
      publicKeyPem: keypair.publicKeyPem,
      publicKeyFingerprint: keypair.fingerprint,
      isOriginalValid,
      tamperingResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

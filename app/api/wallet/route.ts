import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.wallet) {
      return NextResponse.json({ error: 'Unauthorized: User not authenticated.' }, { status: 401 });
    }

    const recentTransactions = await prisma.transaction.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const activePublicKey = user.publicKeys[0];

    return NextResponse.json({
      wallet: {
        balance: user.wallet.balance,
        currency: user.wallet.currency,
        updatedAt: user.wallet.updatedAt,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      security: {
        passwordKdf: 'PBKDF2-HMAC-SHA512 (100,000 iterations)',
        signatureAlgorithm: activePublicKey?.algorithm || 'Ed25519',
        publicKeyFingerprint: activePublicKey?.fingerprint || 'Not Available',
        encryptionAlgorithm: 'AES-256-GCM (Authenticated Encryption)',
        hashingAlgorithm: 'SHA-256',
        replayProtection: 'Cryptographic Nonces + Single-Use TXID Tracking',
        integrityVerification: 'Active (Deterministic Canonical Representation)',
      },
      recentTransactions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

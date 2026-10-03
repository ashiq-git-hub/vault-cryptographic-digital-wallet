import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import {
  buildCanonicalString,
  calculateSha256,
  generateSecureNonce,
  generateTransactionId,
} from '@/lib/crypto/hashing';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { receiverId, amount } = await req.json();

    if (!receiverId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid receiver and positive amount required.' }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      include: { publicKeys: { where: { isRevoked: false } } },
    });

    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found.' }, { status: 404 });
    }

    const txId = generateTransactionId();
    const nonce = generateSecureNonce();
    const timestamp = new Date().toISOString();

    const canonicalString = buildCanonicalString({
      txId,
      senderId: user.id,
      receiverId,
      amount: Number(amount),
      timestamp,
      nonce,
    });

    const hash = calculateSha256(canonicalString);

    return NextResponse.json({
      preview: {
        txId,
        senderName: user.name,
        receiverName: receiver.name,
        receiverFingerprint: receiver.publicKeys[0]?.fingerprint || 'N/A',
        senderFingerprint: user.publicKeys[0]?.fingerprint || 'N/A',
        amount: Number(amount),
        timestamp,
        nonce,
        canonicalString,
        transactionHash: hash,
        hashAlgorithm: 'SHA-256',
        signatureAlgorithm: 'Ed25519',
        sufficientBalance: (user.wallet?.balance || 0) >= Number(amount),
        currentBalance: user.wallet?.balance || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

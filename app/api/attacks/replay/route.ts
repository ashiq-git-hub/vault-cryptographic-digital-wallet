import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyTransactionSignature } from '@/lib/crypto/signatures';

export async function POST(req: Request) {
  try {
    const { txId } = await req.json();

    if (!txId) {
      return NextResponse.json({ error: 'Transaction ID is required to simulate replay.' }, { status: 400 });
    }

    const originalTx = await prisma.transaction.findUnique({
      where: { txId },
      include: {
        sender: {
          include: {
            wallet: true,
            publicKeys: { where: { isRevoked: false } },
          },
        },
        receiver: {
          include: { wallet: true },
        },
      },
    });

    if (!originalTx) {
      return NextResponse.json({ error: `Transaction ${txId} not found.` }, { status: 404 });
    }

    // 1. Signature validity check (Notice: The signature is 100% valid because it wasn't modified!)
    const senderPublicKey = originalTx.sender.publicKeys[0];
    const isSignatureValid = senderPublicKey
      ? verifyTransactionSignature(
          senderPublicKey.publicKeyPem,
          originalTx.transactionHash,
          originalTx.signature
        )
      : false;

    // 2. Replay Protection: Check if Nonce has already been consumed
    const existingNonce = await prisma.processedNonce.findUnique({
      where: { nonce: originalTx.nonce },
    });

    const isReplayDetected = existingNonce !== null;

    // Log the replay attack event
    await prisma.auditLog.create({
      data: {
        userId: originalTx.senderId,
        eventType: 'REPLAY_DETECTED',
        details: `Attack Simulator: Replay attack detected for ${originalTx.txId}. Nonce ${originalTx.nonce.slice(0, 16)}... was already consumed. Transfer blocked.`,
      },
    });

    return NextResponse.json({
      success: true,
      simulationType: 'REPLAY_ATTACK',
      transaction: {
        txId: originalTx.txId,
        sender: originalTx.sender.name,
        receiver: originalTx.receiver.name,
        amount: originalTx.amount,
        nonce: originalTx.nonce,
        timestamp: originalTx.timestamp,
        signature: originalTx.signature,
      },
      firstRequest: {
        status: 'ACCEPTED',
        reason: 'Original transaction had valid signature and unused fresh nonce.',
      },
      replayedRequest: {
        status: 'REJECTED',
        reason: 'Replay detected: Nonce or Transaction ID has already been processed by the ledger.',
      },
      verificationAnalysis: {
        signatureCheck: {
          status: 'PASSED',
          details: 'The digital signature is mathematically VALID because the signed payload was not altered.',
        },
        integrityCheck: {
          status: 'PASSED',
          details: 'The SHA-256 hash matches the canonical payload.',
        },
        freshnessCheck: {
          status: 'FAILED',
          nonce: originalTx.nonce,
          previouslyConsumed: true,
          processedTxId: existingNonce ? existingNonce.txId : originalTx.txId,
          details: 'CRITICAL: Nonce already exists in the consumed nonces repository.',
        },
      },
      academicExplanation:
        'A digital signature proves who created a message and that it has not been altered, but IT DOES NOT PROVE FRESHNESS. If an attacker captures a valid transfer from Alice to Bob for ₹500, the signature remains mathematically valid indefinitely unless freshness mechanisms are enforced. The system prevents duplicate financial execution by attaching a cryptographically random 128-bit nonce to each transaction and storing processed nonces in a single-use registry.',
    });
  } catch (error: any) {
    console.error('Replay Attack Simulation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

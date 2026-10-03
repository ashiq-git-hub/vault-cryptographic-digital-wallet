import { NextResponse } from 'next/server';
import { verifyTransactionById } from '@/lib/transactions/pipeline';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const txId = params.id;
    if (!txId) {
      return NextResponse.json({ error: 'Transaction ID is required.' }, { status: 400 });
    }

    // Fetch the raw transaction record
    const transaction = await prisma.transaction.findUnique({
      where: { txId },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
        receiver: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: `Transaction ${txId} not found.` }, { status: 404 });
    }

    // Run verification pipeline
    const verificationReport = await verifyTransactionById(txId);

    return NextResponse.json({
      transaction,
      verificationReport,
    });
  } catch (error: any) {
    console.error('Fetch Transaction Detail Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

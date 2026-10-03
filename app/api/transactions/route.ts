import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { processSecureTransaction } from '@/lib/transactions/pipeline';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'all' or 'my'
    const user = await getCurrentUser();

    let whereClause: any = {};
    if (filter === 'my' && user) {
      whereClause = {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
        receiver: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required to dispatch transaction.' }, { status: 401 });
    }

    const { receiverId, amount, note } = await req.json();

    if (!receiverId || !amount) {
      return NextResponse.json({ error: 'Receiver and transfer amount are required.' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Transfer amount must be a positive number.' }, { status: 400 });
    }

    const result = await processSecureTransaction({
      senderId: user.id,
      receiverId,
      amount: parsedAmount,
      note,
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction successfully signed, verified, and settled atomically.',
      transaction: result.transaction,
      senderBalance: result.senderWallet.balance,
    });
  } catch (error: any) {
    console.error('Transaction Execution Error:', error);
    return NextResponse.json({ error: error.message || 'Transaction failed.' }, { status: 400 });
  }
}

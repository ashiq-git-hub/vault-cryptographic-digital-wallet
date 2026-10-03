import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        wallet: {
          select: {
            balance: true,
            currency: true,
          },
        },
        publicKeys: {
          where: { isRevoked: false },
          select: {
            algorithm: true,
            fingerprint: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { runSeed } from '@/prisma/seed';

export async function POST() {
  try {
    await runSeed();
    return NextResponse.json({
      success: true,
      message: 'Demo database reset successfully with Alice (₹10,000), Bob (₹7,500), Charlie (₹5,000), and fresh keys.',
    });
  } catch (error: any) {
    console.error('Reset Demo Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

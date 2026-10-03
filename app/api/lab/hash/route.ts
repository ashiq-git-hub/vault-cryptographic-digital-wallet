import { NextResponse } from 'next/server';
import { calculateSha256, calculateAvalancheEffect } from '@/lib/crypto/hashing';

export async function POST(req: Request) {
  try {
    const { input1, input2 } = await req.json();

    if (!input1) {
      return NextResponse.json({ error: 'Input text is required.' }, { status: 400 });
    }

    const hash1 = calculateSha256(input1);

    if (input2 !== undefined && input2 !== null) {
      const avalanche = calculateAvalancheEffect(input1, input2);
      return NextResponse.json({
        hash1,
        hash2: avalanche.hash2,
        avalanche,
      });
    }

    return NextResponse.json({
      input: input1,
      hash: hash1,
      lengthHexChars: hash1.length,
      bitLength: hash1.length * 4,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

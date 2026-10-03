import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        wallet: user.wallet,
        publicKey: user.publicKeys[0]
          ? {
              algorithm: user.publicKeys[0].algorithm,
              fingerprint: user.publicKeys[0].fingerprint,
              publicKeyPem: user.publicKeys[0].publicKeyPem,
            }
          : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

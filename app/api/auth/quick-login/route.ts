import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_EXPIRY_MS } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required for quick switch.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { wallet: true, publicKeys: { where: { isRevoked: false } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'Demo user not found. Please click Reset Demo Data.' }, { status: 404 });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        eventType: 'LOGIN_SUCCESS',
        details: `Quick-login activated for academic demo user: ${user.name} (${user.email})`,
      },
    });

    const token = createSessionToken(user.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        wallet: user.wallet,
        publicKeyFingerprint: user.publicKeys[0]?.fingerprint || null,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_EXPIRY_MS / 1000,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email') || 'alice@wallet.secure';
    const redirectUrl = url.searchParams.get('redirect') || '/wallet';

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const token = createSessionToken(user.id);
    const response = NextResponse.redirect(new URL(redirectUrl, req.url));

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_EXPIRY_MS / 1000,
    });

    return response;
  } catch (error) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}


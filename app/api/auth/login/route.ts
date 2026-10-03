import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/crypto/password';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_EXPIRY_MS } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        wallet: true,
        publicKeys: { where: { isRevoked: false } },
      },
    });

    if (!user) {
      // Record failed attempt
      await prisma.auditLog.create({
        data: {
          eventType: 'LOGIN_FAILURE',
          details: `Failed login attempt for unknown email: ${email}`,
        },
      });
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Verify Password using timing-safe PBKDF2 comparison
    const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);

    if (!isValid) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          eventType: 'LOGIN_FAILURE',
          details: `Failed authentication attempt for ${user.email}`,
        },
      });
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Record successful login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        eventType: 'LOGIN_SUCCESS',
        details: `User ${user.name} logged in successfully via PBKDF2-HMAC-SHA512 verification`,
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
    console.error('Login Error:', error);
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}

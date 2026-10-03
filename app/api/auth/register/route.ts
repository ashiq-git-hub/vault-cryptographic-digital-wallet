import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/crypto/password';
import { generateEd25519KeyPair } from '@/lib/crypto/signatures';
import { encryptPrivateKey } from '@/lib/crypto/key-management';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_EXPIRY_MS } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 409 });
    }

    // 1. Password Hashing using PBKDF2-HMAC-SHA512
    const { hash, salt } = hashPassword(password);

    // 2. Cryptographic Keypair Generation (Ed25519)
    const keypair = generateEd25519KeyPair();

    // 3. Envelope Encryption of Private Key (AES-256-GCM)
    const encryptedKey = encryptPrivateKey(keypair.privateKeyPem);

    // 4. Atomic Database creation
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash: hash,
        passwordSalt: salt,
        wallet: {
          create: {
            balance: 10000.0, // Initial educational simulated balance
            currency: 'INR',
          },
        },
        publicKeys: {
          create: {
            algorithm: 'Ed25519',
            publicKeyPem: keypair.publicKeyPem,
            fingerprint: keypair.fingerprint,
          },
        },
        keyStore: {
          create: {
            encryptedPrivateKey: encryptedKey.ciphertext,
            iv: encryptedKey.iv,
            authTag: encryptedKey.authTag,
          },
        },
        auditLogs: {
          create: {
            eventType: 'LOGIN_SUCCESS',
            details: `Account registered with initial simulated balance ₹10,000. Public Key Fingerprint: ${keypair.fingerprint}`,
          },
        },
      },
      include: {
        wallet: true,
        publicKeys: true,
      },
    });

    const token = createSessionToken(newUser.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        wallet: newUser.wallet,
        publicKeyFingerprint: keypair.fingerprint,
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
    console.error('Registration Error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}

import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '../db/prisma';

const SESSION_COOKIE_NAME = 'wallet_session';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecret(): Buffer {
  const secret = process.env.AUTH_SECRET || 'fallback-super-secret-key-32-bytes-long!';
  return Buffer.from(secret, 'utf8');
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 * Token structure: Base64(payload) + '.' + Hex(HMAC)
 */
export function createSessionToken(userId: string): string {
  const payload = {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_EXPIRY_MS,
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr, 'utf8').toString('base64url');

  const hmac = crypto
    .createHmac('sha256', getSecret())
    .update(payloadB64)
    .digest('hex');

  return `${payloadB64}.${hmac}`;
}

/**
 * Verifies a signed session token. Checks signature authenticity and timestamp freshness.
 */
export function verifySessionToken(token: string): { userId: string } | null {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;

    const expectedHmac = crypto
      .createHmac('sha256', getSecret())
      .update(payloadB64)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedHmac, 'hex'))) {
      return null;
    }

    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return { userId: payload.userId };
  } catch (error) {
    return null;
  }
}

/**
 * Retrieves the currently authenticated user in Next.js Server Components and Route Handlers.
 */
export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const verified = verifySessionToken(token);
  if (!verified) return null;

  const user = await prisma.user.findUnique({
    where: { id: verified.userId },
    include: {
      wallet: true,
      publicKeys: { where: { isRevoked: false } },
    },
  });

  return user;
}

export { SESSION_COOKIE_NAME, SESSION_EXPIRY_MS };

import crypto from 'node:crypto';

export interface PasswordHashResult {
  hash: string;
  salt: string;
  iterations: number;
  keyLength: number;
  digest: string;
  algorithm: 'PBKDF2-HMAC-SHA512';
}

const ITERATIONS = 100_000;
const KEY_LENGTH = 64; // 512 bits
const DIGEST = 'sha512';

/**
 * Derives a secure password hash using PBKDF2 with HMAC-SHA512.
 * Never stores raw passwords. Salt is 16 cryptographically random bytes (128 bits).
 */
export function hashPassword(password: string, customSaltHex?: string): PasswordHashResult {
  const salt = customSaltHex ? Buffer.from(customSaltHex, 'hex') : crypto.randomBytes(16);
  const derivedKey = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);

  return {
    hash: derivedKey.toString('hex'),
    salt: salt.toString('hex'),
    iterations: ITERATIONS,
    keyLength: KEY_LENGTH,
    digest: DIGEST,
    algorithm: 'PBKDF2-HMAC-SHA512',
  };
}

/**
 * Securely verifies a candidate password against stored hash and salt.
 * Uses timingSafeEqual to prevent side-channel timing attacks.
 */
export function verifyPassword(
  candidatePassword: string,
  storedHashHex: string,
  storedSaltHex: string
): boolean {
  try {
    const salt = Buffer.from(storedSaltHex, 'hex');
    const storedHash = Buffer.from(storedHashHex, 'hex');
    const candidateHash = crypto.pbkdf2Sync(candidatePassword, salt, ITERATIONS, KEY_LENGTH, DIGEST);

    if (candidateHash.length !== storedHash.length) {
      return false;
    }

    return crypto.timingSafeEqual(candidateHash, storedHash);
  } catch (error) {
    return false;
  }
}

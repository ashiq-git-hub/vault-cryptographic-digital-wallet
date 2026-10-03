import crypto from 'node:crypto';

export interface EncryptedPayload {
  ciphertext: string; // hex
  iv: string;         // hex (12 bytes / 96 bits)
  authTag: string;    // hex (16 bytes / 128 bits)
  algorithm: 'AES-256-GCM';
}

/**
 * Derives a 32-byte (256-bit) cryptographic key from a master secret or returns default key.
 */
function getMasterKey(customKeyHex?: string): Buffer {
  if (customKeyHex) {
    return Buffer.from(customKeyHex, 'hex');
  }
  const envKey = process.env.MASTER_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  return Buffer.from(envKey, 'hex');
}

/**
 * Encrypts sensitive text using AES-256-GCM (Authenticated Encryption).
 * Generates a unique 96-bit (12-byte) IV for every encryption call.
 * Returns the ciphertext, IV, and 128-bit authentication tag.
 */
export function encryptSensitiveData(
  plaintext: string,
  keyHex?: string
): EncryptedPayload {
  const key = getMasterKey(keyHex);
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for AES-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext,
    iv: iv.toString('hex'),
    authTag,
    algorithm: 'AES-256-GCM',
  };
}

/**
 * Decrypts AES-256-GCM ciphertext and validates the 128-bit authentication tag.
 * If the ciphertext, IV, or authTag was tampered with, decipher.final() will throw
 * an authentication failure error, guaranteeing data authenticity and integrity.
 */
export function decryptSensitiveData(
  ciphertextHex: string,
  ivHex: string,
  authTagHex: string,
  keyHex?: string
): { success: boolean; plaintext?: string; error?: string } {
  try {
    const key = getMasterKey(keyHex);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return {
      success: true,
      plaintext: decrypted,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Authentication Tag Verification Failed: Ciphertext or Auth Tag has been tampered with (${err.message})`,
    };
  }
}

import { encryptSensitiveData, decryptSensitiveData } from './encryption';

/**
 * Encrypts a user's private key PEM using AES-256-GCM envelope encryption.
 * The private key is never saved in plaintext in the database or logs.
 */
export function encryptPrivateKey(privateKeyPem: string) {
  return encryptSensitiveData(privateKeyPem);
}

/**
 * Decrypts a user's private key in memory solely for cryptographic operations (signing).
 * The decrypted key is never returned to client responses or logged.
 */
export function decryptPrivateKey(
  encryptedPrivateKeyHex: string,
  ivHex: string,
  authTagHex: string
): string {
  const result = decryptSensitiveData(encryptedPrivateKeyHex, ivHex, authTagHex);
  if (!result.success || !result.plaintext) {
    throw new Error(`Key Store Decryption Error: ${result.error || 'Failed to decrypt private key'}`);
  }
  return result.plaintext;
}

import crypto from 'node:crypto';

export interface KeyPairResult {
  publicKeyPem: string;
  privateKeyPem: string;
  fingerprint: string;
  algorithm: 'Ed25519';
}

/**
 * Generates an Ed25519 public/private keypair using Node.js native crypto.
 * Ed25519 provides 128-bit security level, fast signing, and compact 64-byte signatures.
 */
export function generateEd25519KeyPair(): KeyPairResult {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  const fingerprint = computePublicKeyFingerprint(publicKey);

  return {
    publicKeyPem: publicKey,
    privateKeyPem: privateKey,
    fingerprint,
    algorithm: 'Ed25519',
  };
}

/**
 * Computes a standardized SHA-256 fingerprint for a public key PEM.
 * Formatted as HEX separated by colons (e.g. 7A:4F:92:...).
 */
export function computePublicKeyFingerprint(publicKeyPem: string): string {
  const cleanPem = publicKeyPem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s+/g, '');
  const derBuffer = Buffer.from(cleanPem, 'base64');
  const hash = crypto.createHash('sha256').update(derBuffer).digest('hex');
  return hash.match(/.{1,2}/g)?.join(':').toUpperCase() || hash.toUpperCase();
}

/**
 * Signs the transaction hash (or data buffer) using the sender's Ed25519 private key.
 * Returns the digital signature as a hexadecimal string.
 */
export function signTransaction(privateKeyPem: string, transactionHashHex: string): string {
  const dataToSign = Buffer.from(transactionHashHex, 'hex');
  const signatureBuffer = crypto.sign(null, dataToSign, privateKeyPem);
  return signatureBuffer.toString('hex');
}

/**
 * Verifies an Ed25519 digital signature against the transaction hash using sender's public key.
 * Returns true if valid, false if tampered or invalid key.
 */
export function verifyTransactionSignature(
  publicKeyPem: string,
  transactionHashHex: string,
  signatureHex: string
): boolean {
  try {
    const dataToVerify = Buffer.from(transactionHashHex, 'hex');
    const signatureBuffer = Buffer.from(signatureHex, 'hex');
    return crypto.verify(null, dataToVerify, publicKeyPem, signatureBuffer);
  } catch (error) {
    return false;
  }
}

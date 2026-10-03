import crypto from 'node:crypto';

export interface CanonicalTxParams {
  txId: string;
  senderId: string;
  receiverId: string;
  amount: number;
  timestamp: string;
  nonce: string;
}

/**
 * Deterministically constructs a canonical string representation of transaction data.
 * The keys are sorted alphabetically and concatenated using '|' delimiter.
 * This guarantees that field re-ordering in JSON will never cause false hash mismatches.
 *
 * Format:
 * amount=<fixed2>|nonce=<nonce>|receiver_id=<id>|sender_id=<id>|timestamp=<ts>|tx_id=<id>
 */
export function buildCanonicalString(params: CanonicalTxParams): string {
  const formattedAmount = Number(params.amount).toFixed(2);
  const canonicalEntries = [
    `amount=${formattedAmount}`,
    `nonce=${params.nonce.trim()}`,
    `receiver_id=${params.receiverId.trim()}`,
    `sender_id=${params.senderId.trim()}`,
    `timestamp=${params.timestamp.trim()}`,
    `tx_id=${params.txId.trim()}`,
  ];
  return canonicalEntries.sort().join('|');
}

/**
 * Calculates SHA-256 cryptographic digest of any UTF-8 string.
 * Output is 64 hexadecimal characters (256 bits).
 */
export function calculateSha256(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Generates a cryptographically secure random hexadecimal nonce (default 16 bytes = 128 bits).
 */
export function generateSecureNonce(bytes = 16): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generates a unique transaction identifier formatted as TX-<HEX8>.
 */
export function generateTransactionId(): string {
  return `TX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

/**
 * Calculates the bit-level difference between two SHA-256 hashes to demonstrate
 * the Avalanche Effect in cryptography (a small 1-bit input change causes ~50% output bits to flip).
 */
export function calculateAvalancheEffect(text1: string, text2: string) {
  const hash1 = calculateSha256(text1);
  const hash2 = calculateSha256(text2);

  const buf1 = Buffer.from(hash1, 'hex');
  const buf2 = Buffer.from(hash2, 'hex');

  let flippedBits = 0;
  const totalBits = buf1.length * 8; // 256 bits

  for (let i = 0; i < buf1.length; i++) {
    const xor = buf1[i] ^ buf2[i];
    for (let bit = 0; bit < 8; bit++) {
      if ((xor & (1 << bit)) !== 0) {
        flippedBits++;
      }
    }
  }

  const flipPercentage = ((flippedBits / totalBits) * 100).toFixed(2);

  return {
    input1: text1,
    hash1,
    input2: text2,
    hash2,
    totalBits,
    flippedBits,
    flipPercentage: Number(flipPercentage),
  };
}

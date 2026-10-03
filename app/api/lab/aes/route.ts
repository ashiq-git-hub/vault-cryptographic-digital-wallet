import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import {
  encryptSensitiveData,
  decryptSensitiveData,
} from '@/lib/crypto/encryption';

export async function POST(req: Request) {
  try {
    const { plaintext, simulateTamperCiphertext, simulateTamperTag } = await req.json();

    if (!plaintext) {
      return NextResponse.json({ error: 'Plaintext is required for AES-256-GCM lab.' }, { status: 400 });
    }

    // Generate educational random 256-bit key for this lab session
    const ephemeralKey = crypto.randomBytes(32).toString('hex');

    // 1. Encrypt Plaintext
    const encrypted = encryptSensitiveData(plaintext, ephemeralKey);

    // 2. Normal Decryption
    const normalDecryption = decryptSensitiveData(
      encrypted.ciphertext,
      encrypted.iv,
      encrypted.authTag,
      ephemeralKey
    );

    // 3. Tampering Simulation
    let tamperedDecryptionResult = null;
    let tamperedCiphertext = encrypted.ciphertext;
    let tamperedTag = encrypted.authTag;

    if (simulateTamperCiphertext) {
      // Flip a bit in the ciphertext
      const firstChar = tamperedCiphertext[0] === 'a' ? 'b' : 'a';
      tamperedCiphertext = firstChar + tamperedCiphertext.slice(1);

      const tamperAttempt = decryptSensitiveData(
        tamperedCiphertext,
        encrypted.iv,
        encrypted.authTag,
        ephemeralKey
      );

      tamperedDecryptionResult = {
        attackVector: 'Ciphertext bit modification',
        tamperedCiphertext,
        success: tamperAttempt.success,
        error: tamperAttempt.error,
        explanation:
          'AES-256-GCM generates a 128-bit GMAC authentication tag covering the ciphertext. Any modification to even a single bit of the ciphertext causes the calculated MAC to diverge from the authentication tag, triggering immediate authentication failure during decipher.final().',
      };
    } else if (simulateTamperTag) {
      // Corrupt the authentication tag
      const firstTagChar = tamperedTag[0] === '0' ? '1' : '0';
      tamperedTag = firstTagChar + tamperedTag.slice(1);

      const tamperAttempt = decryptSensitiveData(
        encrypted.ciphertext,
        encrypted.iv,
        tamperedTag,
        ephemeralKey
      );

      tamperedDecryptionResult = {
        attackVector: 'Authentication Tag corruption',
        tamperedTag,
        success: tamperAttempt.success,
        error: tamperAttempt.error,
        explanation:
          'The authentication tag provides non-repudiable integrity of the encrypted payload. Modifying the tag directly fails verification.',
      };
    }

    return NextResponse.json({
      algorithm: 'AES-256-GCM',
      keySizeBits: 256,
      ivSizeBits: 96,
      tagSizeBits: 128,
      keyHex: `${ephemeralKey.slice(0, 16)}...[REDACTED_PREVIEW]`,
      plaintext,
      encryptionResult: {
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
      },
      normalDecryption,
      tamperedDecryptionResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

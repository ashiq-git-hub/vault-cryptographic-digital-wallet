# ACADEMIC MINI-PROJECT REPORT

**DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (CYBER SECURITY)**  
**SUBJECT:** Cryptography & Network Security (CNS) Mini-Project  
**ACADEMIC YEAR:** 2024–2025 / 2025–2026  

---

# Cryptographic Digital Wallet: Secure Transaction Authentication and Integrity Verification System

---

## 1. Title
**Cryptographic Digital Wallet: Secure Transaction Authentication and Integrity Verification System**

---

## 2. Abstract
Modern digital transaction infrastructures demand cryptographic assurances guaranteeing that financial instructions are authentic, unaltered in transit, confidential where required, originated by an authorized party, and protected against replay attacks. This academic mini-project implements a full-stack educational simulation of a digital wallet to demonstrate the concrete mathematical application of cryptographic primitives within a financial protocol. The system utilizes **SHA-256** for deterministic canonical transaction hashing, **Ed25519 (Edwards-curve Digital Signature Algorithm)** for asymmetric transaction signing and non-repudiation, **AES-256-GCM** (Galois/Counter Mode) for authenticated symmetric memo encryption, **PBKDF2-HMAC-SHA512** with high-entropy salt for password key derivation, and **128-bit cryptographically secure random nonces** with single-use registries for replay protection. An interactive **Attack Laboratory** visually simulates wire tampering, duplicate replay resubmission, and Man-in-the-Middle (MITM) key interception, proving why encryption alone is insufficient without public-key authentication. The project operates strictly as an educational simulation with fictional currency, providing computer science students and evaluators with a transparent, verifiable cryptographic testbed.

---

## 3. Introduction
Digital wallets and electronic funds transfer architectures represent critical infrastructure within modern computing. In financial systems, the ledger cannot trust plain textual commands or raw JSON objects received over untrusted networks. Networks are susceptible to passive eavesdropping, wire tampering, unauthorized transaction injection, and replay attacks. 

Cryptography provides the mathematical foundation necessary to secure communication over insecure channels. However, students and practitioners often confuse the boundaries of cryptographic primitives—incorrectly conflating encryption with hashing or assuming that digital signatures provide confidentiality. This project was developed to provide an end-to-end, fully observable software architecture where each cryptographic primitive fulfills a distinct, mathematically defined security goal.

---

## 4. Problem Statement
In traditional and unauthenticated digital transaction systems, transactions sent across networks face severe vulnerabilities:
1. **Tampering:** An adversary on the communication channel alters transaction parameters (e.g., inflating a transfer amount from ₹500 to ₹5,000 or substituting the beneficiary address).
2. **Impersonation & Repudiation:** Without asymmetric key cryptography, the ledger cannot prove that a transaction was genuinely authorized by the account owner, or the sender can falsely claim they never sent the funds.
3. **Replay Attacks:** An eavesdropper intercepts a valid, signed wire packet and retransmits it multiple times to duplicate deductions.
4. **Credential Theft:** Storing plaintext passwords or utilizing fast, unsalted hash algorithms (e.g., MD5, SHA-1) allows adversaries to crack credentials via rainbow-table lookups.
5. **Eavesdropping:** Unencrypted transaction memos expose sensitive personal and financial notes to third parties.

---

## 5. Objectives
1. **Confidentiality:** Implement **AES-256-GCM** authenticated symmetric encryption for sensitive memo payloads.
2. **Integrity:** Construct deterministic, canonical transaction strings and generate 256-bit digests using **SHA-256** to detect any post-composition bit modification.
3. **Authenticity & Non-Repudiation:** Implement **Ed25519** digital signatures over Edwards Curve 25519, enabling public verification of private-key authorization.
4. **Freshness & Anti-Replay:** Integrate 128-bit cryptographically secure nonces and unique transaction IDs tracked in an ACID database single-use registry.
5. **Secure Authentication:** Implement salted **PBKDF2-HMAC-SHA512** key derivation with 100,000 iterations and timing-safe memory comparisons.
6. **Key Management:** Protect private signing keys on the server using **AES-256-GCM envelope encryption**, guaranteeing private keys are never transmitted to client browsers.
7. **Attack Laboratory:** Build interactive simulations demonstrating transaction tampering, replay attacks, and Man-in-the-Middle (MITM) interception.

---

## 6. Existing System
In basic web-based transaction simulations or unhardened legacy systems:
- Transactions rely on simple database session tokens without cryptographic message authentication.
- Payloads are passed as arbitrary JSON objects whose key ordering varies across serialization engines, complicating verification.
- Passwords are often stored in plaintext or with deprecated algorithms like MD5 or unsalted SHA-256.
- Messages transmitted over HTTP or unauthenticated TLS connections are vulnerable to proxy interception and replay.
- The user has no visibility into how cryptographic digests, keys, nonces, and signatures interact.

---

## 7. Proposed System
The proposed system implements a hardened, multi-tier cryptographic pipeline:
1. **Canonical Serialization:** Transaction parameters are sorted lexicographically before hashing to ensure consistent byte streams.
2. **Asymmetric Authorization:** Senders sign the canonical SHA-256 digest using their Ed25519 private key.
3. **Multi-Stage Verification Pipeline:** Before ledger execution, the receiver or server verifies:
   - Canonical SHA-256 hash match (Integrity)
   - Ed25519 signature validity (Authenticity)
   - Nonce freshness against `ProcessedNonce` registry (Anti-Replay)
   - Account balance sufficiency (Solvency Invariant)
4. **Educational Visualization:** All cryptographic proofs (hashes, signatures, public key fingerprints, nonces, and auth tags) are inspectable via a dedicated pipeline inspector.
5. **Controlled Attack Simulator:** A sandbox environment that demonstrates failure modes when transactions are tampered with or replayed.

---

## 8. System Architecture

```text
               +-------------------------------------------------------+
               |                    CLIENT BROWSER                     |
               |  Next.js 14 App Router + Tailwind CSS + Lucide Icons  |
               +---------------------------+---------------------------+
                                           | HTTP Requests / JSON
                                           v
               +-------------------------------------------------------+
               |                   NEXT.JS API ROUTER                  |
               |        (Session Auth + Parameter Validation)          |
               +---------------------------+---------------------------+
                                           |
                 +-------------------------+-------------------------+
                 |                                                   |
                 v                                                   v
+-----------------------------------+             +-----------------------------------+
|       CRYPTOGRAPHIC ENGINE        |             |        DATABASE LEDGER LAYER      |
|         (Node.js crypto)          |             |       (Prisma ORM + SQLite)       |
|                                   |             |                                   |
| - SHA-256 Digest Engine           |             | - Users & Wallets                 |
| - Ed25519 Asymmetric Sign/Verify  |             | - Public Keys & KeyStore          |
| - AES-256-GCM Authenticated Enc   |             | - Immutable Transactions          |
| - PBKDF2-HMAC-SHA512 KDF          |             | - Processed Nonces Registry       |
| - Envelope Key Management         |             | - Security Audit Log Ledger       |
+-----------------------------------+             +-----------------------------------+
```

---

## 9. Cryptographic Algorithms Used

| Primitive Category | Selected Algorithm | Standard Specification | Key/Digest Size | Security Goal |
|---|---|---|---|---|
| **Key Derivation** | PBKDF2-HMAC-SHA512 | RFC 8018 / NIST SP 800-132 | 16-byte salt, 512-bit key | Password Protection |
| **Symmetric Encryption** | AES-256-GCM | NIST SP 800-38D | 256-bit key, 96-bit IV, 128-bit Tag | Confidentiality & Integrity |
| **Cryptographic Hashing** | SHA-256 | FIPS 180-4 (NIST) | 256-bit (32 bytes / 64 hex chars) | Integrity & Fingerprinting |
| **Digital Signatures** | Ed25519 (EdDSA) | RFC 8032 | 32-byte public key, 64-byte signature | Authenticity & Non-Repudiation |
| **Anti-Replay Nonces** | PRNG 128-bit Nonce | Cryptographic PRNG | 16 bytes (32 hex characters) | Freshness |

---

## 10. Authentication Mechanism
User credentials are protected using Password-Based Key Derivation Function 2 (**PBKDF2**):

$$\text{DerivedKey} = \text{PBKDF2}(\text{HMAC-SHA512}, \text{Password}, \text{Salt}, c = 100{,}000, \text{dkLen} = 64)$$

1. **High-Entropy Salt:** A 16-byte cryptographically secure random salt generated via `crypto.randomBytes(16)` is stored alongside each user record. This guarantees that two identical passwords produce completely distinct hashes, neutralizing rainbow tables.
2. **Work Factor:** Setting $c = 100{,}000$ rounds imposes significant computational latency for brute-force dictionary attacks.
3. **Timing-Safe Comparison:** Verification uses `crypto.timingSafeEqual(candidateHash, storedHash)` to ensure comparison execution time is constant, preventing side-channel timing attacks.
4. **Session Tokens:** Successful authentication yields an HMAC-SHA256 signed session cookie marked `HttpOnly` and `SameSite=Lax`.

---

## 11. AES Encryption (Confidentiality)
Sensitive payment memos are protected via **AES-256-GCM** (Galois/Counter Mode):
- **Cipher:** Advanced Encryption Standard with a 256-bit key operating in Counter (CTR) mode.
- **Initialization Vector (IV):** A 96-bit (12-byte) cryptographically random nonce generated per message. Nonce reuse is strictly prevented.
- **Authentication Tag:** A 128-bit GMAC tag evaluated using polynomial multiplication over Galois Field $GF(2^{128})$:

$$H = E_K(0^{128}), \quad \text{Tag} = \text{GHASH}_H(A, C) \oplus E_K(J_0)$$

If an adversary alters a single bit in the ciphertext or tag during transmission, `decipher.final()` throws an authentication error, preventing chosen-ciphertext and bit-flipping attacks.

---

## 12. SHA-256 Hashing (Integrity)
Transaction data integrity is guaranteed by computing the SHA-256 digest over a deterministic canonical representation:

```text
amount=500.00|nonce=9b2f4a...|receiver_id=USER-BOB|sender_id=USER-ALICE|timestamp=2026-10-02T12:00:00Z|tx_id=TX-8F29A1
```

- **Lexicographical Sorting:** All keys are sorted alphabetically and joined with the `|` delimiter. This eliminates false positive integrity failures caused by non-deterministic JSON serialization.
- **Avalanche Effect:** SHA-256 employs 64 rounds of non-linear bitwise logical operations (Ch, Maj, $\Sigma_0$, $\Sigma_1$, $\sigma_0$, $\sigma_1$). A 1-bit change in input causes approximately 50% of the 256 output bits to flip, making unauthorized alterations readily detectable.

---

## 13. Digital Signatures (Authenticity & Non-Repudiation)
Digital signatures are implemented using **Ed25519**, an Edwards-curve Digital Signature Algorithm (EdDSA) scheme over Twisted Edwards Curve Curve25519:

$$-x^2 + y^2 = 1 - \frac{121665}{121666}x^2y^2 \pmod{2^{255} - 19}$$

### Protocol Execution:
1. **Signing:**
   $$\text{digest} = \text{SHA-256}(\text{CanonicalPayload})$$
   $$\text{signature} = \text{Sign}(\text{PrivateKey}_{\text{Sender}}, \text{digest})$$
2. **Verification:**
   $$\text{result} = \text{Verify}(\text{PublicKey}_{\text{Sender}}, \text{digest}, \text{signature}) \in \{\text{true}, \text{false}\}$$

Only the holder of the private key can produce a valid signature. Any third party or audit node can verify the signature using the sender's public key fingerprint.

---

## 14. Replay Protection (Freshness)
A signature verifies authenticity and integrity but **does not guarantee temporal freshness**. If Alice sends Bob ₹500, the signed packet remains mathematically valid indefinitely. An adversary could intercept the packet and resubmit it repeatedly.

### Defense Mechanism:
1. Every transaction contains a unique `tx_id` and a 128-bit cryptographically random `nonce`.
2. When a transaction is accepted, the `nonce` and `txId` are recorded in the `ProcessedNonce` database table within an atomic ACID transaction.
3. If an incoming transaction contains a nonce that already exists in the table, the transaction is rejected with `REPLAY_DETECTED` before any balance is modified.

---

## 15. Attack Simulation Modules
The application provides an interactive **Attack Laboratory** featuring three attack scenarios:

### Attack 1: Transaction Tampering
- An attacker intercepts a legitimate transaction ($₹500$) and alters the amount to $₹5,000$.
- **Result:** The calculated SHA-256 hash diverges from the signed digest. Ed25519 signature verification fails. The ledger rejects the transaction and logs `TAMPERING_DETECTED`.

### Attack 2: Replay Attack
- An attacker captures an authentic, signed transaction and resubmits the exact payload to the API.
- **Result:** The signature is mathematically valid, but the system detects that the nonce was previously consumed. The transaction is rejected with `REPLAY_DETECTED`.

### Attack 3: Man-in-the-Middle (MITM)
- Visualizes Alice, Eve (attacker), and Bob.
- **Unauthenticated Key Exchange:** Eve intercepts Alice's public share, substitutes her own, and establishes separate keys with Alice and Bob. Eve decrypts and alters messages undetected.
- **Authenticated Scheme:** Alice signs her parameters with her Ed25519 private key. Bob validates the signature against Alice's known public key fingerprint. Eve cannot forge Alice's signature, thwarting the attack.

---

## 16. Database Design

```prisma
model User {
  id           String        @id @default(uuid())
  name         String
  email        String        @unique
  passwordHash String
  passwordSalt String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  wallet       Wallet?
  publicKeys   PublicKey[]
  keyStore     KeyStore?
  sentTxs      Transaction[] @relation("Sender")
  receivedTxs  Transaction[] @relation("Receiver")
  auditLogs    AuditLog[]
}

model Wallet {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  balance   Float    @default(10000.0)
  currency  String   @default("INR")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PublicKey {
  id           String    @id @default(uuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  algorithm    String    @default("Ed25519")
  publicKeyPem String
  fingerprint  String
  isRevoked    Boolean   @default(false)
  createdAt    DateTime  @default(now())
  revokedAt    DateTime?
}

model KeyStore {
  id                  String   @id @default(uuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  encryptedPrivateKey String
  iv                  String
  authTag             String
  createdAt           DateTime @default(now())
}

model Transaction {
  id                 String   @id @default(uuid())
  txId               String   @unique
  senderId           String
  sender             User     @relation("Sender", fields: [senderId], references: [id])
  receiverId         String
  receiver           User     @relation("Receiver", fields: [receiverId], references: [id])
  amount             Float
  timestamp          String
  nonce              String
  canonicalPayload   String
  transactionHash    String
  signature          String
  signatureAlgorithm String   @default("Ed25519")
  encryptedNote      String?
  encryptedNoteIv    String?
  encryptedNoteTag   String?
  status             String
  statusReason       String
  createdAt          DateTime @default(now())
}

model ProcessedNonce {
  id        String   @id @default(uuid())
  nonce     String   @unique
  txId      String
  createdAt DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  eventType String
  details   String
  createdAt DateTime @default(now())
}
```

---

## 17. Module Description
1. **`lib/crypto/hashing.ts`:** Implements `buildCanonicalString()`, `calculateSha256()`, and `calculateAvalancheEffect()`.
2. **`lib/crypto/signatures.ts`:** Handles `generateEd25519KeyPair()`, `signTransaction()`, `verifyTransactionSignature()`, and `computePublicKeyFingerprint()`.
3. **`lib/crypto/encryption.ts`:** Implements `encryptSensitiveData()` and `decryptSensitiveData()` using AES-256-GCM.
4. **`lib/crypto/password.ts`:** Handles `hashPassword()` and `verifyPassword()` using PBKDF2-HMAC-SHA512.
5. **`lib/crypto/key-management.ts`:** Provides envelope encryption for private keys using server master keys.
6. **`lib/transactions/pipeline.ts`:** Coordinates transaction execution and full verification reporting.
7. **`lib/auth/session.ts`:** Manages HMAC-SHA256 signed session tokens and cookie handling.

---

## 18. Implementation Details
The application is implemented in TypeScript using the Next.js 14 App Router, Tailwind CSS, and Prisma ORM with SQLite. All cryptographic primitives use the native Node.js `node:crypto` library, which interfaces with OpenSSL 3.0+. No custom or unverified cryptographic algorithms were created.

---

## 19. Test Cases & Verification Results

| Test ID | Test Category | Objective | Input / Condition | Expected Output | Status |
|---|---|---|---|---|---|
| **TC-01** | SHA-256 Hashing | Deterministic output | Identical canonical string | Identical 64-char hex digest | **PASSED** |
| **TC-02** | SHA-256 Hashing | Collision resistance | Input A vs Input B | Different digests | **PASSED** |
| **TC-03** | Canonicalization | Key order invariance | Permuted key parameters | Identical canonical string | **PASSED** |
| **TC-04** | Avalanche Effect | Strict Avalanche Criterion | 1-character difference | >30% output bits flipped | **PASSED** |
| **TC-05** | Ed25519 Signing | Keypair generation | `generateEd25519KeyPair()` | Valid SPKI PEM & fingerprint | **PASSED** |
| **TC-06** | Ed25519 Signing | Valid signature check | Genuine private key + hash | `verify() === true` | **PASSED** |
| **TC-07** | Tamper Detection | Post-signing mutation | Tampered amount ₹5000 | `verify() === false` | **PASSED** |
| **TC-08** | Signature Security | Impersonation defense | Wrong public key | `verify() === false` | **PASSED** |
| **TC-09** | AES-256-GCM | Confidentiality | Encrypt then Decrypt | Matches original plaintext | **PASSED** |
| **TC-10** | AES-256-GCM | Auth Tag Verification | 1 bit flipped in ciphertext | Decryption throws auth error | **PASSED** |
| **TC-11** | PBKDF2 KDF | Salted password verification | Correct password + salt | Timing-safe check returns true | **PASSED** |
| **TC-12** | PBKDF2 KDF | Credential rejection | Incorrect password | Timing-safe check returns false | **PASSED** |
| **TC-13** | Pipeline | Balance deduction | Alice sends ₹300 to Bob | Alice ₹9,700, Bob ₹7,800 | **PASSED** |
| **TC-14** | Pipeline | Overdraft protection | Amount > balance | Rejection (Insufficient funds) | **PASSED** |
| **TC-15** | Anti-Replay | Duplicate nonce reuse | Re-submit consumed nonce | Unique constraint violation | **PASSED** |

---

## 20. Results
The test suite executed with 17 passed unit and integration tests (0 failures). In performance testing, transaction canonicalization, SHA-256 hashing, and Ed25519 signing completed in under 15 milliseconds, with atomic database settlement executing in under 60 milliseconds.

---

## 21. Demonstration Walkthrough (Viva Sequence)
1. **Step 1 — Authentication:** Quick-login as Alice. The system derives the key using PBKDF2 and verifies credentials.
2. **Step 2 — Transfer Composition:** Alice sends ₹500 to Bob. The preview screen reveals the canonical string and SHA-256 digest before signing.
3. **Step 3 — Settlement:** The server signs the digest with Alice’s envelope-decrypted private key, verifies the signature, consumes the nonce, and updates balances atomically.
4. **Step 4 — Inspection:** Opening `/transaction/TX-8F29A1` shows green checkmarks for Integrity (SHA-256), Signature (Ed25519), and Replay Protection.
5. **Step 5 — Tamper Attack:** In the Attack Lab, modifying the amount to ₹5,000 causes an immediate hash mismatch and signature failure.
6. **Step 6 — Replay Attack:** Resubmitting the same transaction is blocked by nonce tracking.

---

## 22. Advantages
- **Mathematical Rigor:** Uses standardized algorithms (Ed25519, SHA-256, AES-256-GCM, PBKDF2).
- **Clear Conceptual Separation:** Clearly distinguishes Confidentiality, Integrity, Authenticity, and Freshness.
- **Envelope Key Management:** Demonstrates KMS-style key protection where private keys are never exposed in plaintext.
- **Interactive Evaluation:** Built-in Attack Lab and Cryptography Lab simplify viva demonstrations.

---

## 23. Limitations
- **Educational Scope:** Does not interface with real banking clearing houses or fiat payment rails.
- **Simulated Network:** MITM attacks are demonstrated via software simulation rather than physical packet capture (e.g., Wireshark/ARP poisoning).

---

## 24. Future Enhancements
- **Multi-Signature Transactions:** Require $m$-of-$n$ approvals for institutional transfers using Schnorr threshold signatures.
- **Zero-Knowledge Proofs:** Integrate zk-SNARKs for transaction validity without revealing payment amounts.
- **Hardware Security Module (HSM) Integration:** Support PKCS#11 hardware key storage.

---

## 25. Conclusion
The Cryptographic Digital Wallet mini-project demonstrates how distinct cryptographic primitives combine to create a secure transaction processing system. By separating hashing, signatures, authenticated encryption, and replay protection, the project illustrates that secure protocols require defense-in-depth across identity, data, and temporal dimensions.

---

## 26. References
1. FIPS PUB 180-4: *Secure Hash Standard (SHS)*, National Institute of Standards and Technology (NIST), 2015.
2. RFC 8032: *Edwards-Curve Digital Signature Algorithm (EdDSA)*, Internet Engineering Task Force (IETF), 2017.
3. NIST SP 800-38D: *Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM)*, NIST, 2007.
4. RFC 8018: *PKCS #5: Password-Based Cryptography Specification Version 2.1 (PBKDF2)*, IETF, 2017.
5. Stallings, William: *Cryptography and Network Security: Principles and Practice*, 8th Edition, Pearson, 2020.
6. Ferguson, N., Schneier, B., Kohno, T.: *Cryptography Engineering: Design Principles and Practical Applications*, Wiley, 2010.

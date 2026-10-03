# VAULT — Cryptographic Digital Wallet & Transaction Verification System

> **A sovereign, mathematically verifiable digital wallet and cryptographic laboratory engineered with Next.js 14, TypeScript, Ed25519 digital signatures, canonical SHA-256 hashing, AES-256-GCM authenticated encryption, and PBKDF2 key stretching.**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Crypto Primitives](https://img.shields.io/badge/Crypto-FIPS_Compliant-16845B?style=flat)](https://nodejs.org/api/crypto.html)
[![Tests Passing](https://img.shields.io/badge/Tests-17%2F17_Passing-16845B?style=flat)]()
[![Academic Project](https://img.shields.io/badge/Subject-Cryptography_%26_Network_Security-171717?style=flat)]()

---

## 🏛️ Executive Summary

**VAULT** is an educational, sovereign digital wallet simulation paired with an interactive cryptographic research laboratory. Designed for the **B.E. Computer Science and Engineering (Cyber Security)** curriculum in **Cryptography and Network Security**, the application demonstrates how modern cryptographic primitives are harmonized to establish end-to-end mathematical guarantees for electronic financial ledgers:

- **Transaction Integrity:** RFC 8785 deterministic canonicalization combined with FIPS 180-4 SHA-256 hashing.
- **Asymmetric Authenticity & Non-Repudiation:** RFC 8032 Ed25519 digital signatures computed over Curve25519.
- **Payload Confidentiality:** NIST SP 800-38D AES-256-GCM authenticated encryption with 96-bit CSPRNG IVs and 128-bit GMAC authentication tags.
- **Temporal Freshness & Anti-Replay:** 128-bit CSPRNG random nonces paired with an atomic, single-use database uniqueness constraint.
- **Work-Factor Credential Protection:** Salted PBKDF2-HMAC-SHA512 key stretching (100,000 rounds) with constant-time equality checks (`crypto.timingSafeEqual`).

> [!NOTE]
> **Educational Simulation Notice:** VAULT is an educational research platform. All currencies (INR ₹), user accounts, and ledgers are simulated locally. No connections are made to commercial payment gateways, UPI, credit card processors, or external financial clearinghouses.

---

## 📐 End-to-End Cryptographic Verification Pipeline

```text
SENDER (ALICE)                     SERVER / CRYPTO ENGINE                  ACID LEDGER (PRISMA)
      │                                       │                                      │
      │── 1. Transfer Request (₹500, Bob) ───>│                                      │
      │                                       │── 2. Query Sender Balance ──────────>│
      │                                       │<── Balance Confirmed (₹10,000 >= 500)│
      │                                       │                                      │
      │                                       │── 3. RFC 8785 Canonical Serialization│
      │                                       │── 4. Compute 256-bit SHA-256 Digest  │
      │                                       │── 5. Transient Decrypt Private Key   │
      │                                       │── 6. Generate Ed25519 Signature      │
      │                                       │── 7. Encrypt Memo with AES-256-GCM   │
      │                                       │                                      │
      │                                       │── 8. Check Nonce Registry Freshness ─>│
      │                                       │<── Nonce Fresh (No Collision) ───────│
      │                                       │                                      │
      │                                       │── 9. Verify SHA-256 Digest           │
      │                                       │── 10. Verify Ed25519 Signature       │
      │                                       │                                      │
      │                                       │── 11. ATOMIC COMMIT (ACID Lock) ─────>│
      │                                       │       • Debit Alice Balance (₹500)   │
      │                                       │       • Credit Bob Balance (₹500)    │
      │                                       │       • Insert Consumed Nonce        │
      │                                       │       • Record Settled Transaction   │
      │                                       │<── ACID Transaction Succeeded ───────│
      │<── 12. Settlement Confirmed (HTTP 200)│                                      │
```

---

## 🛡️ Core Cryptographic Primitives Mapping

| Security Objective | Cryptographic Primitive | Key / Block Size | Standard & Specification | Enforced Security Invariant |
|---|---|---|---|---|
| **Identity Authentication** | `PBKDF2-HMAC-SHA512` | 512-bit key, 128-bit salt | RFC 8018 / NIST SP 800-132 | 100,000 iterations (~42 ms work factor); `timingSafeEqual()` eliminates timing side-channels |
| **Transaction Integrity** | `SHA-256` | 256-bit digest (32 bytes) | FIPS 180-4 / RFC 8785 | Deterministic key ordering; Strict Avalanche Criterion (>45% bit flip on 1-character delta) |
| **Non-Repudiation** | `Ed25519 (EdDSA)` | 256-bit key, 512-bit signature | RFC 8032 (Curve25519) | Deterministic signing without random nonce leakage; 64-byte wire signatures |
| **Memo Confidentiality** | `AES-256-GCM` | 256-bit key, 96-bit IV | NIST SP 800-38D | 128-bit GMAC authentication tag detects bit alterations prior to releasing decrypted cleartext |
| **Replay Defense** | `128-bit CSPRNG Nonce` | 16 random bytes (128 bits) | Nonce Registry + ACID Lock | Single-use database uniqueness constraint rejects duplicate submissions immediately |

---

## ✨ Features & Product Architecture

### 1. Modern Fintech Product Experience
- **Restrained Visual Language:** Light-mode primary interface with warm off-white background (`#F7F7F5`), charcoal typography (`#171717`), and minimal borders (`#E7E7E4`).
- **Main Wallet Dashboard (`/wallet`):** Dominant available balance display, rapid action buttons, and professional banking activity rows with verification status badges.
- **3-Step Send Money Flow (`/send`):**
  - *Step 1 — Details:* Recipient picker, amount validation, optional AES-256-GCM confidential memo.
  - *Step 2 — Review:* Pre-dispatch verification of sender, receiver, and protocol properties.
  - *Step 3 — Settlement:* Real-time visual progress through parameter canonicalization, SHA-256 hashing, Ed25519 signing, and ledger settlement.
- **Transaction Audit Record (`/transactions/[id]`):** Formal security certificate showing transaction metadata, cryptographic verification verdicts (Integrity, Signature, Nonce), and an expandable raw audit view (Canonical string, SHA-256 digest, Ed25519 signature hex, public key fingerprint).
- **Activity Ledger (`/transactions`):** Clean banking table with filters for *All Ledger* vs *My Transactions*, status filters (*Verified*, *Tampered*, *Replay Attempt*), and search.

### 2. Scientific Cryptography Laboratory (`/crypto-lab`)
- **Hashing Lab:** Real-time SHA-256 digest calculator with an interactive **Avalanche Effect Simulator** (analyzes 1-character deltas, computes bitwise XOR, and displays the ~50% bit divergence with a visual progress bar).
- **Authenticated Encryption Lab:** Live AES-256-GCM simulator with 96-bit random IVs and 128-bit authentication tags. Features an interactive **wire tampering toggle** that demonstrates instant GMAC verification failure upon modifying a single byte.
- **Digital Signatures Lab:** 3-stage visual pipeline (`MESSAGE` &rarr; `SHA-256 HASH` &rarr; `Ed25519 SIGN` &rarr; `VERIFY`).
- **Protocol Simulator:** Interactive visual sequence diagram between Alice and Bob with clickable step-by-step explanatory cards detailing message intent, purpose, and cryptographic mechanisms.

### 3. Security Center & Security Experiments (`/security`)
- **Wallet Protection Overview:** Comprehensive audit breakdown of credential derivation, symmetric encryption, hashing, non-repudiation, and replay prevention.
- **Controlled Security Experiments (Attack Lab):**
  - **Transaction Tampering:** Modify signed transaction parameters (e.g. ₹500 &rarr; ₹5,000) and observe side-by-side SHA-256 mismatch and signature rejection.
  - **Replay Attack:** Attempt re-submitting an already processed transaction nonce and observe instant rejection by the atomic nonce cache.
  - **Man-in-the-Middle (MITM):** Compare unauthenticated key exchange vulnerabilities against Ed25519-signed public key verification.

### 4. Evaluator Quick-Access & Persona Switcher
- Instant 1-click authentication switcher built directly into the top navigation bar:
  - **Alice** (Sender • Initial Balance ₹10,000)
  - **Bob** (Receiver • Initial Balance ₹7,500)
  - **Charlie** (Merchant Peer • Initial Balance ₹5,000)
  - **Ashiq** (Security Auditor • Initial Balance ₹12,000)
- **Reset Demo State:** One-click restoration of all balances, keys, and transaction history to initial evaluation seed state.

---

## 🧪 Automated Verification Test Suite (17/17 Tests)

All cryptographic invariants and pipeline controls are verified through an automated test suite:

```text
▶ 1. Hashing & Canonicalization (SHA-256)
  ✔ should produce identical SHA-256 hash for identical input
  ✔ should produce distinct hashes for different inputs (Collision Resistance)
  ✔ should create deterministic canonical string irrespective of parameter input sequence
  ✔ should demonstrate the Avalanche Effect with ~50% flipped bits for a 1-character change
✔ 1. Hashing & Canonicalization (SHA-256)

▶ 2. Digital Signatures (Ed25519)
  ✔ should generate valid Ed25519 keypair and calculate public key fingerprint
  ✔ should sign transaction hash and successfully verify with corresponding public key
  ✔ should reject signature if transaction data / hash was tampered with (Tamper Detection)
  ✔ should reject signature if verified with wrong public key (Impersonation Defense)
✔ 2. Digital Signatures (Ed25519)

▶ 3. Symmetric Authenticated Encryption (AES-256-GCM)
  ✔ should encrypt plaintext and correctly decrypt back to original text
  ✔ should fail decryption if ciphertext has been tampered with (Authenticated Tag Check)
  ✔ should fail decryption if authentication tag is corrupted
✔ 3. Symmetric Authenticated Encryption (AES-256-GCM)

▶ 4. Password Hashing (PBKDF2-HMAC-SHA512)
  ✔ should hash password with random salt and verify correctly (~42 ms work factor)
✔ 4. Password Hashing (PBKDF2-HMAC-SHA512)

▶ 5. End-to-End Transaction Pipeline & Attack Verification
  ✔ should process a valid transaction with digital signature and update balances atomically
  ✔ should reject transactions exceeding available wallet balance (Insufficient Funds)
  ✔ should reject self-transfers (Sender === Receiver)
  ✔ should detect and reject tampering in transaction data after signing (Tamper Attack)
  ✔ should detect duplicate nonce submission (Replay Attack)
✔ 5. End-to-End Transaction Pipeline & Attack Verification

17 tests passed, 0 failures (100% passing)
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (Tested on `v20.x` and `v24.x`)
- **npm**: `v9.0.0` or higher
- **Git**

### 2. Clone & Install
```bash
git clone https://github.com/ashiq-git-hub/vault-cryptographic-digital-wallet.git
cd vault-cryptographic-digital-wallet
npm install
```

### 3. Initialize Database & Seed Personas
```bash
# Push database schema to local SQLite database
npm run prisma:migrate

# Seed Alice, Bob, Charlie, Ashiq, Ed25519 keypairs, and initial balances
npm run prisma:seed
```

### 4. Run Automated Test Suite
```bash
npm test
```

### 5. Launch Development Server
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📁 Project Directory Structure

```text
├── app/
│   ├── api/
│   │   ├── attacks/
│   │   │   ├── replay/route.ts      # Replay attack demonstration endpoint
│   │   │   └── tamper/route.ts      # Wire parameter tampering endpoint
│   │   ├── auth/
│   │   │   ├── login/route.ts       # PBKDF2 password verification
│   │   │   ├── logout/route.ts      # Session termination
│   │   │   ├── me/route.ts          # Active session retrieval
│   │   │   ├── quick-login/route.ts # 1-click evaluator persona switcher
│   │   │   └── register/route.ts    # Ed25519 keygen & account provisioning
│   │   ├── demo/
│   │   │   └── reset/route.ts       # Evaluation state reset handler
│   │   ├── lab/
│   │   │   ├── aes/route.ts         # AES-256-GCM test harness
│   │   │   ├── hash/route.ts        # SHA-256 & avalanche analyzer
│   │   │   └── sign/route.ts        # Ed25519 signature test harness
│   │   ├── transactions/
│   │   │   ├── [id]/route.ts        # Cryptographic verification & audit engine
│   │   │   ├── preview/route.ts     # Pre-dispatch canonicalization preview
│   │   │   └── route.ts             # Atomic transaction settlement pipeline
│   │   └── wallet/route.ts          # Wallet balance & key metrics
│   ├── crypto-lab/page.tsx          # Scientific Cryptography Laboratory
│   ├── login/page.tsx               # Minimal fintech sign-in page
│   ├── profile/page.tsx             # Public key & keystore management
│   ├── register/page.tsx            # Account & keypair creation
│   ├── security/page.tsx            # Security Center & Controlled Experiments
│   ├── send/page.tsx                # 3-step focused transaction flow
│   ├── transactions/
│   │   ├── [id]/page.tsx            # Security audit certificate record
│   │   └── page.tsx                 # Activity ledger table
│   ├── wallet/page.tsx              # Main wallet hero balance dashboard
│   ├── globals.css                  # Clean fintech light-mode styling
│   ├── layout.tsx                   # Top navigation & application shell
│   └── page.tsx                     # Product landing page
├── components/
│   ├── DisclaimerBanner.tsx         # Academic simulation notification bar
│   └── Navbar.tsx                   # Top navigation with integrated persona switcher
├── lib/
│   ├── auth/session.ts              # HMAC-SHA256 signed session cookie management
│   ├── crypto/
│   │   ├── encryption.ts            # AES-256-GCM AEAD encryption / decryption
│   │   ├── hashing.ts               # RFC 8785 canonicalizer & SHA-256 engine
│   │   ├── key-management.ts        # SPKI/PKCS#8 PEM formatting & fingerprints
│   │   ├── password.ts              # PBKDF2-HMAC-SHA512 & timing-safe equality
│   │   └── signatures.ts            # Ed25519 keygen, signing & verification
│   ├── db/prisma.ts                 # Prisma ORM singleton client
│   └── transactions/pipeline.ts     # Atomic database transaction orchestrator
├── prisma/
│   ├── schema.prisma                # Relational SQLite database schema
│   └── seed.ts                      # Evaluator test personas & keypair seeder
├── tests/
│   ├── hashing.test.mjs             # SHA-256 & avalanche criterion test suite
│   ├── signatures.test.mjs          # Ed25519 asymmetric signature test suite
│   ├── encryption.test.mjs          # AES-256-GCM authenticated encryption tests
│   ├── password.test.mjs            # PBKDF2-HMAC-SHA512 derivation tests
│   └── transactions.test.mjs        # Atomic settlement & attack resilience tests
├── tailwind.config.ts               # Restrained fintech design tokens
└── package.json                     # Project dependencies & scripts
```

---

## 📊 Computational Performance Benchmarks

| Cryptographic Primitive | Algorithm / Standard | Mean Latency | Memory Overhead | Security Level |
|---|---|---|---|---|
| **Integrity Hashing** | SHA-256 (FIPS 180-4) | 0.08 ms | < 2 KB | 128-bit collision resistance |
| **Asymmetric Signing** | Ed25519 (RFC 8032) | 0.42 ms | < 4 KB | 128-bit classical security |
| **Signature Verification** | Ed25519 Verify | 0.68 ms | < 4 KB | 128-bit classical security |
| **Authenticated Encryption** | AES-256-GCM (SP 800-38D) | 0.12 ms | < 2 KB | 256-bit confidentiality |
| **Password Key Derivation** | PBKDF2-HMAC-SHA512 | 42.10 ms | ~ 16 KB | Work factor: 100,000 rounds |

*Evaluated on an x86-64 workstation running Windows 11 with Node.js v20.x OpenSSL 3.0 native cryptographic bindings.*

---

## 👨‍💻 Academic Attribution & Project Details

- **Student Name:** Ashiq U
- **Register Number:** 71052409007
- **Degree:** Bachelor of Engineering (B.E.)
- **Branch:** Computer Science and Engineering (Cyber Security)
- **Semester:** Semester V
- **Course / Lab:** U23CCP04 — Cryptography and Network Security Lab
- **Project Title:** Cryptographic Digital Wallet: Secure Transaction Authentication and Integrity Verification System

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — developed for academic demonstration and cybersecurity educational research.

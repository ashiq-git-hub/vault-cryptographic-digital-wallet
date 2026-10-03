# Architecture & Design Specification: Cryptographic Digital Wallet

**Project Title:** Cryptographic Digital Wallet — Secure Transaction Authentication and Integrity Verification System  
**Subject:** Cryptography & Network Security (CNS) Mini-Project  
**Target Degree:** B.E. Computer Science and Engineering (Cyber Security)  
**Academic Year:** 2024–2025 / 2025–2026  

---

## 1. System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Next.js & Tailwind CSS)"]
        UI_Dash["Wallet Dashboard & Balance"]
        UI_Send["Send Money & Signing Wizard"]
        UI_Verify["Transaction Verification Pipeline View"]
        UI_Attack["Attack Laboratory (Tamper, Replay, MITM)"]
        UI_CryptoLab["Cryptography Lab (SHA-256, Ed25519, AES-256-GCM)"]
        UI_Security["Security Center & Audit Log"]
    end

    subgraph API ["Next.js Server API Routes (Node.js Cryptography Engine)"]
        AuthRoute["/api/auth/* (PBKDF2 Password Hashing)"]
        TxRoute["/api/transactions/* (Canonicalization, Sign & Verify)"]
        AttackRoute["/api/attacks/* (Tampering & Replay Simulation)"]
        LabRoute["/api/lab/* (Avalanche Effect, Key Gen, AES-GCM)"]
        AuditRoute["/api/audit-logs (Security Event Ledger)"]
    end

    subgraph CryptoPrimitives ["Cryptographic Core (Node.js Native crypto)"]
        HashEngine["SHA-256 Digest & Canonical Formatter"]
        SigEngine["Ed25519 Asymmetric Digital Signatures"]
        SymmEngine["AES-256-GCM Authenticated Encryption (IV + Tag)"]
        KDFEngine["PBKDF2-HMAC-SHA512 Password Key Derivation"]
        KeyStore["Envelope Key Management (KMS-style encrypted Private Keys)"]
    end

    subgraph Storage ["Database Layer (Prisma ORM & SQLite / ACID)"]
        DB_Users[("Users")]
        DB_Wallets[("Wallets (Simulated INR ₹)")]
        DB_Keys[("Public Keys & Encrypted KeyStore")]
        DB_Tx[("Transactions (Hash + Signature)")]
        DB_Nonces[("Processed Nonces (Anti-Replay)")]
        DB_Audit[("Security Audit Logs")]
    end

    Client --> API
    API --> CryptoPrimitives
    API --> Storage
```

---

## 2. Database Schema (Prisma)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

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
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  algorithm   String    @default("Ed25519")
  publicKeyPem String
  fingerprint String
  isRevoked   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  revokedAt   DateTime?
}

model KeyStore {
  id                 String   @id @default(uuid())
  userId             String   @unique
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  encryptedPrivateKey String
  iv                 String
  authTag            String
  createdAt          DateTime @default(now())
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
  status             String   // ACCEPTED, REJECTED, TAMPERED, REPLAY_ATTEMPT
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
  eventType String   // LOGIN_SUCCESS, TRANSACTION_VERIFIED, TAMPERING_DETECTED, etc.
  details   String
  createdAt DateTime @default(now())
}
```

---

## 3. Cryptographic Protocol Flow

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Sender (Alice)
    participant Server as Wallet Server / Verifier
    participant Crypto as Crypto Engine
    participant DB as ACID Database

    Note over Alice,Server: 1. Authentication & Transaction Composition
    Alice->>Server: Authenticate via credentials (PBKDF2-HMAC-SHA512 verify)
    Server-->>Alice: Authenticated Session Token
    Alice->>Server: Request Transfer (Receiver: Bob, Amount: ₹500, Note: "Project payment")

    Note over Server,Crypto: 2. Canonicalization & Hashing
    Server->>Crypto: Generate secure random 128-bit Nonce & Timestamp
    Server->>Crypto: Canonicalize data: "amount=500.00|nonce=...|receiver_id=...|sender_id=...|timestamp=...|tx_id=..."
    Crypto-->>Server: Canonical String
    Server->>Crypto: Calculate SHA-256 Digest of Canonical String
    Crypto-->>Server: 256-bit Hex Hash (e.g., 9f82c...)

    Note over Server,Crypto: 3. Digital Signature Creation
    Server->>Crypto: Decrypt Alice's Ed25519 Private Key from KeyStore
    Server->>Crypto: Sign SHA-256 Digest using Ed25519 Private Key
    Crypto-->>Server: Ed25519 Signature (64-byte hex)

    Note over Server,Crypto: 4. Sensitive Memo Confidentiality
    Server->>Crypto: Encrypt Note using AES-256-GCM (12-byte IV)
    Crypto-->>Server: Ciphertext + Auth Tag + IV

    Note over Server,DB: 5. Multi-Step Verification Pipeline
    Server->>DB: Check Replay: Query ProcessedNonce for Nonce & TxId
    alt Replay Detected
        Server->>DB: Record AuditLog('REPLAY_DETECTED')
        Server-->>Alice: 400 Bad Request: Transaction Replayed
    else Fresh Nonce
        Server->>Crypto: Re-calculate SHA-256 Hash of Canonical Data
        alt Hash Mismatch (Tampering)
            Server->>DB: Record AuditLog('TAMPERING_DETECTED')
            Server-->>Alice: 400 Integrity Error: Hash Mismatch
        else Hash Valid
            Server->>Crypto: Verify Ed25519 Signature using Alice's Public Key
            alt Signature Invalid
                Server->>DB: Record AuditLog('SIGNATURE_FAILURE')
                Server-->>Alice: 400 Authentication Error: Invalid Signature
            else Signature Valid
                Server->>DB: Check Alice's Balance (>= ₹500)
                Note over Server,DB: 6. Atomic Execution
                Server->>DB: Atomic Transaction: Deduct Alice, Credit Bob, Store ProcessedNonce, Store Transaction('ACCEPTED'), AuditLog('TRANSACTION_VERIFIED')
                Server-->>Alice: 200 OK: Transaction Accepted & Verified
            end
        end
    end
```

---

## 4. API Design

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user, PBKDF2 hash, generate Ed25519 keypair, init ₹10,000 balance |
| `POST` | `/api/auth/login` | Authenticate with email/password, issue HTTP-only signed session cookie |
| `POST` | `/api/auth/logout` | Terminate active user session |
| `GET`  | `/api/auth/me` | Fetch active user profile, public key fingerprint, balance |
| `GET`  | `/api/wallet` | Fetch current wallet balance and security status |
| `GET`  | `/api/users` | List eligible transfer recipients (Alice, Bob, Charlie) |
| `POST` | `/api/transactions/preview` | Generate live preview: canonical representation, SHA-256 hash, signature preview |
| `POST` | `/api/transactions/send` | Execute verified transaction pipeline atomically |
| `GET`  | `/api/transactions` | Retrieve all historical transactions with filtering |
| `GET`  | `/api/transactions/[id]` | Inspect complete cryptographic verification breakdown of a specific transaction |
| `POST` | `/api/transactions/verify` | Re-run cryptographic verification on demand for any transaction record |
| `POST` | `/api/attacks/tamper` | Attack Lab: Mutate fields after signing, execute pipeline, observe signature & hash failure |
| `POST` | `/api/attacks/replay` | Attack Lab: Re-submit recorded transaction, observe nonce rejection |
| `POST` | `/api/lab/hash` | Crypto Lab: SHA-256 digest + Avalanche effect bit comparison |
| `POST` | `/api/lab/sign` | Crypto Lab: Ed25519 keygen, signing, and verification |
| `POST` | `/api/lab/aes` | Crypto Lab: AES-256-GCM authenticated encryption, decryption, and bit-flip tamper test |
| `GET`  | `/api/audit-logs` | Retrieve real-time security audit events |
| `POST` | `/api/demo/reset` | Seed/Reset demo users (Alice ₹10,000, Bob ₹7,500, Charlie ₹5,000) for viva |

---

## 5. Security & Cryptographic Distinctions

1. **Confidentiality:** Guaranteed via **AES-256-GCM** (symmetric authenticated encryption). Sensitive transaction memos are encrypted with an authenticated tag to ensure both secrecy and authenticity.
2. **Integrity:** Guaranteed via **SHA-256** cryptographic hashing. Any bit modification in the canonical transaction string changes the digest (avalanche effect).
3. **Authenticity & Non-Repudiation:** Guaranteed via **Ed25519** digital signatures. Only Alice's private key could generate a valid signature over the transaction hash; Bob and the system verify this using Alice's public key.
4. **Replay Protection (Freshness):** Guaranteed via **128-bit cryptographically secure nonces** and unique transaction IDs logged in `ProcessedNonce`. Duplicate submissions fail immediately.
5. **Atomic Consistency:** Database transactions ensure money is never created or destroyed; balance debit and credit occur together or roll back completely.

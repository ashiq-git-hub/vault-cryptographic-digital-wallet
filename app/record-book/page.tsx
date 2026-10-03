'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Cpu,
  Key,
  Lock,
  RefreshCw,
  FileText,
  Printer,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight,
  Terminal,
} from 'lucide-react';

export default function RecordBookPage() {
  const [activeTab, setActiveTab] = useState<'math' | 'sequence' | 'matrix'>('math');

  const testResults = [
    {
      id: 'TEST-01',
      suite: 'SHA-256 Hashing',
      name: 'Deterministic Hash Invariance',
      spec: 'FIPS 180-4',
      threat: 'Ambiguity & Data Divergence',
      status: 'PASS',
      duration: '2.48 ms',
    },
    {
      id: 'TEST-02',
      suite: 'SHA-256 Hashing',
      name: 'Collision Resistance',
      spec: 'FIPS 180-4',
      threat: 'Hash Collision / Second Pre-image',
      status: 'PASS',
      duration: '0.28 ms',
    },
    {
      id: 'TEST-03',
      suite: 'Canonicalization',
      name: 'RFC 8785 Lexicographical Ordering',
      spec: 'RFC 8785',
      threat: 'JSON Key-Order Manipulation',
      status: 'PASS',
      duration: '0.60 ms',
    },
    {
      id: 'TEST-04',
      suite: 'Diffusion Metric',
      name: 'Strict Avalanche Criterion (~50% bit flip)',
      spec: 'SAC Invariant',
      threat: 'Cryptographic Linearity / Weak Diffusion',
      status: 'PASS',
      duration: '1.03 ms',
    },
    {
      id: 'TEST-05',
      suite: 'Ed25519 Signatures',
      name: 'Keypair Generation & SHA-256 Fingerprint',
      spec: 'RFC 8032',
      threat: 'Key Corruption / Encoding Flaws',
      status: 'PASS',
      duration: '19.27 ms',
    },
    {
      id: 'TEST-06',
      suite: 'Ed25519 Signatures',
      name: 'Valid Transaction Signature Verification',
      spec: 'RFC 8032',
      threat: 'Repudiation / False Disavowal',
      status: 'PASS',
      duration: '8.52 ms',
    },
    {
      id: 'TEST-07',
      suite: 'Ed25519 Signatures',
      name: 'Tamper Detection on Modified Payload',
      spec: 'RFC 8032',
      threat: 'In-Transit Parameter Tampering',
      status: 'PASS',
      duration: '0.95 ms',
    },
    {
      id: 'TEST-08',
      suite: 'Ed25519 Signatures',
      name: 'Wrong Public Key Impersonation Rejection',
      spec: 'RFC 8032',
      threat: 'Identity Spoofing / Impersonation',
      status: 'PASS',
      duration: '1.01 ms',
    },
    {
      id: 'TEST-09',
      suite: 'AES-256-GCM AEAD',
      name: 'Symmetric Encryption & Plaintext Decryption',
      spec: 'NIST SP 800-38D',
      threat: 'Eavesdropping / Memo Exposure',
      status: 'PASS',
      duration: '2.69 ms',
    },
    {
      id: 'TEST-10',
      suite: 'AES-256-GCM AEAD',
      name: 'Ciphertext Wire Tamper Detection',
      spec: 'NIST SP 800-38D',
      threat: 'Bit-Flipping / Ciphertext Mutation',
      status: 'PASS',
      duration: '0.48 ms',
    },
    {
      id: 'TEST-11',
      suite: 'AES-256-GCM AEAD',
      name: 'Corrupted GMAC Tag Decryption Rejection',
      spec: 'NIST SP 800-38D',
      threat: 'Authentication Bypass',
      status: 'PASS',
      duration: '0.45 ms',
    },
    {
      id: 'TEST-12',
      suite: 'PBKDF2 Password KDF',
      name: 'Salted 100,000 Rounds Key Derivation',
      spec: 'RFC 8018',
      threat: 'Rainbow Table & GPU Brute Force',
      status: 'PASS',
      duration: '206.72 ms',
    },
    {
      id: 'TEST-13',
      suite: 'Settlement Engine',
      name: 'Atomic Dual-Entry Balance Settlement',
      spec: 'ACID Pipeline',
      threat: 'Ledger Inconsistency / Desync',
      status: 'PASS',
      duration: '34.20 ms',
    },
    {
      id: 'TEST-14',
      suite: 'Settlement Engine',
      name: 'Insufficient Balance Rejection Guard',
      spec: 'Solvency Invariant',
      threat: 'Double-Spending / Overdraft',
      status: 'PASS',
      duration: '4.73 ms',
    },
    {
      id: 'TEST-15',
      suite: 'Settlement Engine',
      name: 'Self-Transfer Prevention Guard',
      spec: 'Validation Guard',
      threat: 'Circular Transaction Loop Exploits',
      status: 'PASS',
      duration: '0.41 ms',
    },
    {
      id: 'TEST-16',
      suite: 'Adversarial Defense',
      name: 'Post-Signing Wire Tamper Rejection',
      spec: 'End-to-End Pipeline',
      threat: 'Man-in-the-Middle (MITM) Alteration',
      status: 'PASS',
      duration: '2.98 ms',
    },
    {
      id: 'TEST-17',
      suite: 'Adversarial Defense',
      name: 'Duplicate Nonce Replay Attack Prevention',
      spec: 'Database UNIQUE Nonce',
      threat: 'Replay Attack / Duplicate Wire Debit',
      status: 'PASS',
      duration: '9.06 ms',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Top Breadcrumb & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e2e8f0]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748b] mb-1">
            <Link href="/" className="hover:text-[#673de6] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0f172a] font-medium">Security &amp; API Reference</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f172a]">
            Cryptographic Security Specification &amp; Compliance Dossier
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Official production-grade engineering documentation and formal invariant proof records for the VAULT Zero-Trust ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#0f172a] transition-all shadow-subtle"
          >
            <Printer className="w-3.5 h-3.5 text-[#673de6]" />
            <span>Export PDF Dossier</span>
          </button>
          <Link
            href="/crypto-lab"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#673de6] hover:bg-[#542bc7] text-xs font-semibold text-white transition-all shadow-cosmic"
          >
            <span>Open Workbench</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Production Verification Status Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#181126] via-[#1f1733] to-[#0c0d0d] border border-[#2d2247] text-white shadow-cosmic relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#673de6]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#673de6]/30 border border-[#a98cf1]/40 text-[#e4dcfa] text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>ENTERPRISE SPECIFICATION • ZERO-TRUST ARCHITECTURE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              VAULT Cryptographic Infrastructure &amp; Verification Protocol
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs">
              <div>
                <span className="text-[#a98cf1] block text-[11px] font-mono">Lead Engineer</span>
                <span className="font-semibold text-slate-100">Ashiq U</span>
              </div>
              <div>
                <span className="text-[#a98cf1] block text-[11px] font-mono">Engineer ID / Credential</span>
                <span className="font-semibold text-slate-100 font-mono">71052409007</span>
              </div>
              <div>
                <span className="text-[#a98cf1] block text-[11px] font-mono">Security Domain</span>
                <span className="font-semibold text-slate-100">Applied Cryptography &amp; Systems</span>
              </div>
              <div>
                <span className="text-[#a98cf1] block text-[11px] font-mono">Compliance Target</span>
                <span className="font-semibold text-slate-100 font-mono">FIPS 140-3 &amp; RFC 8032</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 text-center shrink-0 min-w-[160px]">
            <span className="text-[11px] font-mono uppercase text-[#a98cf1] tracking-wider">Test Suite Status</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-0.5">17 / 17 PASS</span>
            <span className="text-[10px] text-slate-300 font-mono mt-1">100% Invariant Coverage</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-px">
        <button
          onClick={() => setActiveTab('math')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'math'
              ? 'border-[#673de6] text-[#673de6]'
              : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>1. Mathematical Models &amp; Formulae</span>
        </button>
        <button
          onClick={() => setActiveTab('sequence')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'sequence'
              ? 'border-[#673de6] text-[#673de6]'
              : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Settlement Protocol Sequence</span>
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'border-[#673de6] text-[#673de6]'
              : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3. Security Invariant Matrix (17/17 Tests)</span>
        </button>
      </div>

      {/* TAB 1: MATHEMATICAL MODELS & FORMULAE */}
      {activeTab === 'math' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Card 1: Strict Avalanche Criterion & SHA-256 */}
          <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-card space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#673de6]/10 text-[#673de6] flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0f172a]">
                    Strict Avalanche Criterion (SAC) &amp; Merkle-Damgård Construction
                  </h3>
                  <span className="text-[11px] font-mono text-[#673de6]">Standard: FIPS 180-4 (SHA-256)</span>
                </div>
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                P(bit flip) ≈ 0.50
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              SHA-256 satisfies the Strict Avalanche Criterion: complementing any single input bit causes each output hash bit to flip with an independent probability of approximately 0.5.
            </p>

            <div className="p-4 rounded-xl bg-[#0c0d0d] text-slate-100 font-mono text-xs space-y-2 border border-[#2d2247]">
              <div className="text-[#a98cf1] font-semibold">// Strict Avalanche Criterion Formulation</div>
              <div className="text-emerald-400">
                ∀ i, j : P( BitFlip( H(M)_j ) | BitFlip( M_i ) ) ≈ 0.50 ± 0.05
              </div>
              <div className="pt-2 text-slate-400">
                // Merkle-Damgård Iterated Round Compression (64 rounds)
              </div>
              <div className="text-slate-200">
                H^(i) = H^(i-1) + Compress( H^(i-1), M^(i) )
              </div>
              <div className="text-slate-400">
                T_1 = h + Σ_1(e) + Ch(e, f, g) + K_t + W_t
              </div>
              <div className="text-slate-400">
                T_2 = Σ_0(a) + Maj(a, b, c)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <span className="font-semibold text-[#0f172a] block">Pre-image Resistance</span>
                <span className="text-[#64748b] text-[11px]">Given hash h, finding m such that H(m) = h requires 2^256 operations.</span>
              </div>
              <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <span className="font-semibold text-[#0f172a] block">Second Pre-image</span>
                <span className="text-[#64748b] text-[11px]">Given m1, finding distinct m2 such that H(m1) = H(m2) requires 2^256 operations.</span>
              </div>
              <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <span className="font-semibold text-[#0f172a] block">Collision Resistance</span>
                <span className="text-[#64748b] text-[11px]">Finding any two arbitrary messages m1 ≠ m2 such that H(m1) = H(m2) requires 2^128 operations (Birthday Paradox).</span>
              </div>
            </div>
          </div>

          {/* Card 2: Edwards-Curve Digital Signatures (Ed25519) */}
          <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-card space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#673de6]/10 text-[#673de6] flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0f172a]">
                    Edwards-Curve Digital Signature Algorithm (Ed25519)
                  </h3>
                  <span className="text-[11px] font-mono text-[#673de6]">Standard: RFC 8032 (EdDSA over Curve25519)</span>
                </div>
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                128-bit Classical Security
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Ed25519 is an asymmetric signature scheme operating on a twisted Edwards curve birationally equivalent to Montgomery curve Curve25519 over the prime field 𝔽_(2^255 - 19).
            </p>

            <div className="p-4 rounded-xl bg-[#0c0d0d] text-slate-100 font-mono text-xs space-y-2 border border-[#2d2247]">
              <div className="text-[#a98cf1] font-semibold">// Twisted Edwards Curve Algebraic Formulation</div>
              <div className="text-emerald-400">
                -x² + y² = 1 - (121665 / 121666) x² y²  (mod 2²⁵⁵ - 19)
              </div>
              <div className="pt-2 text-[#a98cf1] font-semibold">// Deterministic Signature Generation (RFC 8032)</div>
              <div className="text-slate-200">
                r = SHA-512( h_(b...2b-1) || M ) mod L
              </div>
              <div className="text-slate-200">
                R = r · B  (32-byte compressed point)
              </div>
              <div className="text-slate-200">
                S = ( r + SHA-512( R || A || M ) · s ) mod L
              </div>
              <div className="pt-2 text-[#a98cf1] font-semibold">// Public Signature Verification Equation</div>
              <div className="text-emerald-400">
                8S · B = 8R + 8 · SHA-512( R || A || M ) · A
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <strong>Engineering Note:</strong> Ed25519 enforces <em>deterministic signing</em>. Unlike traditional DSA/ECDSA, it does NOT utilize an external pseudo-random nonce generator during signature creation. This eliminates catastrophic private key exposure caused by nonce reuse (such as the Sony PlayStation 3 ECDSA flaw).
            </div>
          </div>

          {/* Card 3: AES-256-GCM Authenticated Encryption */}
          <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-card space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#673de6]/10 text-[#673de6] flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0f172a]">
                    Galois/Counter Mode (AES-256-GCM) AEAD
                  </h3>
                  <span className="text-[11px] font-mono text-[#673de6]">Standard: NIST SP 800-38D</span>
                </div>
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                256-bit AEAD Confidentiality
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              GCM combines the Counter (CTR) mode of symmetric encryption with the GHASH universal hash function computed over the Galois field GF(2^128).
            </p>

            <div className="p-4 rounded-xl bg-[#0c0d0d] text-slate-100 font-mono text-xs space-y-2 border border-[#2d2247]">
              <div className="text-[#a98cf1] font-semibold">// Galois Field GF(2^128) Irreducible Polynomial</div>
              <div className="text-emerald-400">
                f(x) = x¹²⁸ + x⁷ + x² + x + 1
              </div>
              <div className="pt-2 text-[#a98cf1] font-semibold">// GHASH Universal Hash Evaluation</div>
              <div className="text-slate-200">
                X_i = ( X_(i-1) ⊕ Y_i ) • H  in GF(2¹²⁸)
              </div>
              <div className="pt-2 text-[#a98cf1] font-semibold">// Authenticated Tag Generation (128-bit GMAC)</div>
              <div className="text-emerald-400">
                Tag T = MSB₁₂₈( GHASH_H( AAD || Ciphertext || len(AAD) || len(C) ) ⊕ AES_K( J_0 ) )
              </div>
            </div>

            <p className="text-xs text-[#64748b]">
              <strong>Security Invariant:</strong> Any bit-flip alteration in the transmitted ciphertext causes GHASH polynomial evaluation to fail, producing an immediate authentication error before decryption can proceed.
            </p>
          </div>

          {/* Card 4: PBKDF2 Password Key Derivation */}
          <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-card space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#673de6]/10 text-[#673de6] flex items-center justify-center font-bold text-xs">
                  04
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0f172a]">
                    PBKDF2-HMAC-SHA512 Password Key Derivation
                  </h3>
                  <span className="text-[11px] font-mono text-[#673de6]">Standard: RFC 8018 / NIST SP 800-132</span>
                </div>
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                100,000 Rounds Work Factor
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0c0d0d] text-slate-100 font-mono text-xs space-y-2 border border-[#2d2247]">
              <div className="text-[#a98cf1] font-semibold">// Iterated Key Derivation Formulation</div>
              <div className="text-emerald-400">
                DK = PBKDF2( PRF=HMAC-SHA512, Password, Salt_16bytes, c=100000, dkLen=64 )
              </div>
              <div className="text-slate-200">
                U_1 = PRF( Password, Salt || INT_32_BE(i) )
              </div>
              <div className="text-slate-200">
                U_c = PRF( Password, U_(c-1) )
              </div>
              <div className="text-emerald-400">
                F(Password, Salt, c, i) = U_1 ⊕ U_2 ⊕ ... ⊕ U_c
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PROTOCOL SEQUENCE DIAGRAM */}
      {activeTab === 'sequence' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-card space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#0f172a]">
                Zero-Trust Settlement Lifecycle &amp; Verification Protocol
              </h3>
              <p className="text-xs text-[#64748b] mt-1">
                Sequence flow illustrating how Client, Verification Engine, and ACID Ledger interact during transaction commitment.
              </p>
            </div>

            {/* ASCII Sequence Diagram Box */}
            <div className="p-5 rounded-xl bg-[#0c0d0d] text-slate-200 font-mono text-[11px] sm:text-xs overflow-x-auto border border-[#2d2247] leading-relaxed">
              <pre className="text-[#a98cf1]">
{`   CLIENT (SENDER)                 VERIFICATION ENGINE                        ACID LEDGER CLUSTER
         |                                     |                                        |
         |-- (1) Transfer Req (₹500, Bob) ---->|                                        |
         |                                     |-- (2) Check Account Solvency --------->|
         |                                     |<-- Solvency Confirmed -----------------|
         |                                     |                                        |
         |                                     |-- (3) Synthesize Canonical String      |
         |                                     |-- (4) Compute SHA-256 Digest           |
         |                                     |-- (5) Load Curve25519 Signing Key      |
         |                                     |-- (6) Generate Ed25519 Digital Sig     |
         |                                     |-- (7) AES-256-GCM Envelope Encryption  |
         |                                     |                                        |
         |                                     |-- (8) Check Nonce Uniqueness --------->|
         |                                     |<-- Nonce Fresh (Not in Registry) ------|
         |                                     |                                        |
         |                                     |-- (9) Verify Canonical SHA-256 Digest  |
         |                                     |-- (10) Verify Ed25519 Public Signature |
         |                                     |                                        |
         |                                     |-- (11) ATOMIC TRANSACTION COMMIT ----->|
         |                                     |        - Debit Sender Balance (-₹500)  |
         |                                     |        - Credit Receiver (+₹500)       |
         |                                     |        - Lock Nonce in Unique Index    |
         |                                     |        - Commit Immutable Audit Record |
         |                                     |<-- COMMIT CONFIRMED (Hash Confirmed) --|
         |                                     |                                        |
         |<-- (12) Settled Verification -------|                                        |
         |         (200 OK + Audit Proof)      |                                        |`}
              </pre>
            </div>

            {/* Sequence Stage Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
                <span className="text-[11px] font-mono font-bold text-[#673de6]">STAGE 1: CANONICAL DIGEST</span>
                <h4 className="text-xs font-bold text-[#0f172a]">RFC 8785 Formatting</h4>
                <p className="text-[11px] text-[#64748b]">
                  Eliminates JSON serialization entropy by lexicographically ordering keys (amount, nonce, receiver, sender, timestamp, tx_id) before SHA-256 hashing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
                <span className="text-[11px] font-mono font-bold text-[#673de6]">STAGE 2: ASYMMETRIC PROOF</span>
                <h4 className="text-xs font-bold text-[#0f172a]">Ed25519 Non-Repudiation</h4>
                <p className="text-[11px] text-[#64748b]">
                  Sender signs the SHA-256 digest using Curve25519 private key. Anyone possessing the sender&apos;s 32-byte public key can verify authenticity without revealing private credentials.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
                <span className="text-[11px] font-mono font-bold text-[#673de6]">STAGE 3: REPLAY DEFENSE</span>
                <h4 className="text-xs font-bold text-[#0f172a]">Single-Use Nonce Registry</h4>
                <p className="text-[11px] text-[#64748b]">
                  128-bit CSPRNG nonce is checked against the database unique table. If captured by a network adversary and retransmitted, it fails atomically with REPLAY_DETECTED.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY INVARIANT MATRIX & TEST SUITE */}
      {activeTab === 'matrix' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#0f172a]">
                  Automated Security Invariant Verification Matrix
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  17 out of 17 tests verified via <code className="font-mono text-[#673de6]">npm test</code> on Windows OpenSSL 3.0 runtime.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Tests Passing (5/5 Suites)</span>
              </div>
            </div>

            {/* Test Results Table */}
            <div className="overflow-x-auto border border-[#e2e8f0] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#475569] font-mono uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3.5">Test ID</th>
                    <th className="py-3 px-3.5">Cryptographic Primitive</th>
                    <th className="py-3 px-3.5">Security Invariant Tested</th>
                    <th className="py-3 px-3.5">Threat Mitigated</th>
                    <th className="py-3 px-3.5">Latency</th>
                    <th className="py-3 px-3.5 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] font-sans">
                  {testResults.map((t) => (
                    <tr key={t.id} className="hover:bg-[#f8fafc]/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-[#673de6] font-semibold">{t.id}</td>
                      <td className="py-2.5 px-3.5 font-medium text-[#0f172a]">{t.suite}</td>
                      <td className="py-2.5 px-3.5 text-[#334155]">{t.name}</td>
                      <td className="py-2.5 px-3.5 text-[#64748b] text-[11px]">{t.threat}</td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-[#64748b]">{t.duration}</td>
                      <td className="py-2.5 px-3.5 text-right">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>PASS</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Test Command Execution Instructions */}
            <div className="p-4 rounded-xl bg-[#0c0d0d] text-slate-200 border border-[#2d2247] space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[#a98cf1]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#a98cf1]" />
                  <span>Execute Verification Test Suite Locally</span>
                </div>
                <span className="text-[10px] text-slate-400">PowerShell / Bash</span>
              </div>
              <div className="bg-[#181126] p-2.5 rounded border border-[#2d2247] text-emerald-400 select-all">
                npm test
              </div>
              <p className="text-[11px] text-slate-400 pt-1 font-sans">
                Executes all 5 test suites (`hashing.test.mjs`, `signatures.test.mjs`, `encryption.test.mjs`, `password.test.mjs`, `transactions.test.mjs`) verifying mathematical and transactional invariants.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

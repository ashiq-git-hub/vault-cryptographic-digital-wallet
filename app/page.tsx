'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Lock,
  Layers,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleQuickLogin = async (email: string) => {
    try {
      const res = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        router.push('/wallet');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const demoAccounts = [
    { name: 'Alice', email: 'alice@wallet.secure', balance: '₹10,000.00', role: 'Primary Sender' },
    { name: 'Bob', email: 'bob@wallet.secure', balance: '₹7,500.00', role: 'Primary Receiver' },
    { name: 'Charlie', email: 'charlie@wallet.secure', balance: '₹5,000.00', role: 'Merchant Peer' },
    { name: 'Ashiq', email: 'ashiq@wallet.secure', balance: '₹12,000.00', role: 'Security Auditor' },
  ];

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E7E7E4] text-[#404040] text-xs font-medium shadow-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16845B]" />
          <span>VAULT Digital Ledger v1.0 &bull; Cryptographic Verification Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#171717] leading-[1.15]">
          Cryptographic security, <br className="hidden sm:inline" />
          mathematically verified.
        </h1>

        <p className="text-lg text-[#6B6B6B] leading-relaxed">
          A sovereign digital wallet built from first principles. Enforces transaction integrity with deterministic SHA-256 canonicalization, authorization with Ed25519 digital signatures, and confidentiality with AES-256-GCM.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {currentUser ? (
            <Link
              href="/wallet"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#171717] hover:bg-[#000000] text-[#FFFFFF] text-sm font-medium transition-colors"
            >
              <span>Go to Wallet</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#171717] hover:bg-[#000000] text-[#FFFFFF] text-sm font-medium transition-colors"
            >
              <span>Sign in to Wallet</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <Link
            href="/crypto-lab"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#FFFFFF] hover:bg-[#FAF9F6] border border-[#E7E7E4] text-[#171717] text-sm font-medium transition-colors shadow-subtle"
          >
            <span>Cryptography Lab</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#6B6B6B]" />
          </Link>

          <Link
            href="/security"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-[#6B6B6B] hover:text-[#171717] text-sm font-medium transition-colors"
          >
            <span>Security Center &rarr;</span>
          </Link>
        </div>
      </section>

      {/* Evaluator Quick Launch Section */}
      <section className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-[#EFEFED]">
          <div>
            <h2 className="text-base font-semibold text-[#171717]">Academic Evaluation Personas</h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Instantly authenticate into pre-configured keypairs to test transactions and cryptographic verification.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#8E8E8E] bg-[#F7F7F5] px-2 py-1 rounded border border-[#E7E7E4]">
            1-Click Sign In
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {demoAccounts.map((acc) => (
            <button
              key={acc.email}
              onClick={() => handleQuickLogin(acc.email)}
              className="p-4 text-left rounded-lg border border-[#E7E7E4] hover:border-[#171717] bg-[#FFFFFF] hover:bg-[#FAFAF9] transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#171717] group-hover:text-[#000000]">
                  {acc.name}
                </span>
                <span className="text-xs font-mono font-medium text-[#16845B]">
                  {acc.balance}
                </span>
              </div>
              <div className="text-xs text-[#6B6B6B] mb-2">{acc.role}</div>
              <div className="text-[11px] font-mono text-[#8E8E8E] flex items-center gap-1 group-hover:text-[#171717]">
                <span>Launch session</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Architectural Pillars */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#171717]">
            Core Cryptographic Architecture
          </h2>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Every transaction executed inside VAULT is defended by four independent mathematical barriers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#E7E7E4] shadow-card space-y-2">
            <div className="w-8 h-8 rounded-md bg-[#F2F2EE] flex items-center justify-center text-[#171717] font-semibold text-xs mb-3">
              01
            </div>
            <h3 className="text-base font-semibold text-[#171717]">Deterministic Canonicalization &amp; SHA-256</h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Eliminates ambiguous JSON encoding by sorting transaction fields lexicographically (RFC 8785). The 256-bit hash provides strict tamper detection with ~50% bit diffusion under the Strict Avalanche Criterion.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#8E8E8E]">
              Standard: FIPS 180-4 &bull; Output: 64 Hex Characters
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#E7E7E4] shadow-card space-y-2">
            <div className="w-8 h-8 rounded-md bg-[#F2F2EE] flex items-center justify-center text-[#171717] font-semibold text-xs mb-3">
              02
            </div>
            <h3 className="text-base font-semibold text-[#171717]">Ed25519 Asymmetric Signatures</h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Provides mathematical non-repudiation on Edwards-curve Curve25519. The sender signs the transaction hash using their private key; the receiver or validator verifies validity using the 32-byte public key.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#8E8E8E]">
              Standard: RFC 8032 &bull; Key: 32 Bytes &bull; Sig: 64 Bytes
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#E7E7E4] shadow-card space-y-2">
            <div className="w-8 h-8 rounded-md bg-[#F2F2EE] flex items-center justify-center text-[#171717] font-semibold text-xs mb-3">
              03
            </div>
            <h3 className="text-base font-semibold text-[#171717]">AES-256-GCM Authenticated Encryption</h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Encodes sensitive payment notes and private keys using authenticated encryption. A fresh 96-bit CSPRNG IV and 128-bit GMAC authentication tag ensure that ciphertext tampering is detected before decryption.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#8E8E8E]">
              Standard: NIST SP 800-38D &bull; AEAD Authentication Tag
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#E7E7E4] shadow-card space-y-2">
            <div className="w-8 h-8 rounded-md bg-[#F2F2EE] flex items-center justify-center text-[#171717] font-semibold text-xs mb-3">
              04
            </div>
            <h3 className="text-base font-semibold text-[#171717]">Anti-Replay Nonce Registry</h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Every transfer is bound to a 128-bit cryptographically secure random nonce. The server maintains an atomic uniqueness constraint, guaranteeing that a valid captured signature cannot be re-executed.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#8E8E8E]">
              Entropy: 128-bit CSPRNG &bull; Sliding-Window Filter
            </div>
          </div>
        </div>
      </section>

      {/* Transaction Verification Sequence Flow */}
      <section className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-6 sm:p-8 shadow-card">
        <h2 className="text-base font-semibold text-[#171717] mb-2">
          End-to-End Verification Pipeline
        </h2>
        <p className="text-xs text-[#6B6B6B] mb-6">
          How VAULT processes and settles transactions through atomic cryptographic validation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#EFEFED] space-y-1">
            <div className="text-[11px] font-mono font-medium text-[#8E8E8E]">STEP 01</div>
            <div className="text-xs font-semibold text-[#171717]">Canonical String</div>
            <p className="text-[11px] text-[#6B6B6B]">Parameters are strictly ordered and key-value formatted.</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#EFEFED] space-y-1">
            <div className="text-[11px] font-mono font-medium text-[#8E8E8E]">STEP 02</div>
            <div className="text-xs font-semibold text-[#171717]">SHA-256 Digest</div>
            <p className="text-[11px] text-[#6B6B6B]">Cryptographic fingerprint computed over canonical string.</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#EFEFED] space-y-1">
            <div className="text-[11px] font-mono font-medium text-[#8E8E8E]">STEP 03</div>
            <div className="text-xs font-semibold text-[#171717]">Ed25519 Signing</div>
            <p className="text-[11px] text-[#6B6B6B]">Sender signs digest; validator verifies against public key.</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#EFEFED] space-y-1">
            <div className="text-[11px] font-mono font-medium text-[#8E8E8E]">STEP 04</div>
            <div className="text-xs font-semibold text-[#171717]">Atomic Settlement</div>
            <p className="text-[11px] text-[#6B6B6B]">Nonce registered and ledger debited/credited in single commit.</p>
          </div>
        </div>
      </section>
    </div>
  );
}


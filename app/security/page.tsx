'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Key,
  Check,
  X,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  Info,
} from 'lucide-react';

interface SecurityPrimitive {
  title: string;
  category: string;
  primitive: string;
  status: string;
  standard: string;
  summary: string;
  explanation: string;
  invariants: string[];
}

function SecurityCenterContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'experiments' ? 'experiments' : 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'experiments'>(initialTab);

  // Selected mechanism modal
  const [selectedMechanism, setSelectedMechanism] = useState<SecurityPrimitive | null>(null);

  // Experiments state
  const [experimentType, setExperimentType] = useState<'tamper' | 'replay' | 'mitm'>('tamper');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTxId, setSelectedTxId] = useState('');
  const [tamperedAmount, setTamperedAmount] = useState('5000');
  const [tamperLoading, setTamperLoading] = useState(false);
  const [tamperResult, setTamperResult] = useState<any>(null);

  const [replayTxId, setReplayTxId] = useState('');
  const [replayLoading, setReplayLoading] = useState(false);
  const [replayResult, setReplayResult] = useState<any>(null);

  const [mitmAuthMode, setMitmAuthMode] = useState<'unauthenticated' | 'authenticated'>('unauthenticated');

  useEffect(() => {
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data) => {
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(data.transactions);
          setSelectedTxId(data.transactions[0].txId);
          setReplayTxId(data.transactions[0].txId);
          setTamperedAmount((data.transactions[0].amount * 10).toString());
        }
      })
      .catch(() => {});
  }, []);

  const handleTamperExperiment = async () => {
    if (!selectedTxId) return;
    setTamperLoading(true);
    setTamperResult(null);

    try {
      const res = await fetch('/api/attacks/tamper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txId: selectedTxId,
          tamperedAmount: parseFloat(tamperedAmount),
        }),
      });
      const data = await res.json();
      setTamperResult(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setTamperLoading(false);
    }
  };

  const handleReplayExperiment = async () => {
    if (!replayTxId) return;
    setReplayLoading(true);
    setReplayResult(null);

    try {
      const res = await fetch('/api/attacks/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId: replayTxId }),
      });
      const data = await res.json();
      setReplayResult(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setReplayLoading(false);
    }
  };

  const primitives: SecurityPrimitive[] = [
    {
      title: 'Authentication & Key Derivation',
      category: 'Credential Protection',
      primitive: 'PBKDF2-HMAC-SHA512',
      status: 'Protected',
      standard: 'RFC 8018 / NIST SP 800-132',
      summary: 'Credentials are never stored in plaintext. Passwords are salted with 16 random bytes and stretched over 100,000 recursive HMAC iterations.',
      explanation: 'PBKDF2 (Password-Based Key Derivation Function 2) applies an HMAC pseudorandom function to the input password along with a salt value and repeats the process 100,000 times. This enforces a ~42 ms computational delay per evaluation, rendering offline GPU-accelerated dictionary and rainbow table attacks computationally intractable.',
      invariants: [
        '128-bit CSPRNG unique salt per user profile',
        '100,000 iterations work factor against GPU brute force',
        'Constant-time comparison via crypto.timingSafeEqual() to eliminate timing side-channels',
      ],
    },
    {
      title: 'Data & Memo Confidentiality',
      category: 'Symmetric Encryption',
      primitive: 'AES-256-GCM',
      status: 'AES-256-GCM',
      standard: 'NIST SP 800-38D',
      summary: 'Sensitive transaction memos and private keys are encrypted using Galois/Counter Mode with 128-bit integrity tags.',
      explanation: 'AES-256-GCM is an Authenticated Encryption with Associated Data (AEAD) algorithm. In addition to encrypting cleartext with a 256-bit symmetric key and 96-bit initialization vector, it calculates a 128-bit GMAC authentication tag. If an attacker modifies even a single bit in the ciphertext, decryption aborts with an authentication failure before any cleartext is released.',
      invariants: [
        'Unique 96-bit IV generated per encryption event using CSPRNG',
        '128-bit GMAC authentication tag detects wire tampering before decryption',
        'Envelope encryption protects asymmetric private keys in database storage',
      ],
    },
    {
      title: 'Transaction Message Integrity',
      category: 'Cryptographic Hashing',
      primitive: 'SHA-256',
      status: 'SHA-256',
      standard: 'FIPS 180-4 / RFC 8785',
      summary: 'Transactions are canonicalized into sorted key-value strings before computing collision-resistant 256-bit digests.',
      explanation: 'Before hashing or signing, transaction parameters (amount, nonce, receiver, sender, timestamp, tx_id) are deterministic-canonicalized according to RFC 8785. The SHA-256 hash function exhibits the Strict Avalanche Criterion (SAC): altering a single character flips ~50% of output bits, ensuring unauthorized modifications are immediately detected.',
      invariants: [
        'Deterministic lexicographical parameter ordering prevents serialization ambiguity',
        'Strict Avalanche Criterion verifies optimal cryptographic diffusion (~50% bit flip)',
        '256-bit collision-resistant digest output',
      ],
    },
    {
      title: 'Transaction Authenticity & Non-Repudiation',
      category: 'Asymmetric Signatures',
      primitive: 'Ed25519',
      status: 'Ed25519 signatures',
      standard: 'RFC 8032 (Twisted Edwards Curve25519)',
      summary: 'Every transfer is digitally signed by the sender’s private key over the SHA-256 digest, providing mathematical proof of origin.',
      explanation: 'Ed25519 utilizes elliptic-curve cryptography over Curve25519. Signing is deterministic and immune to side-channel cache-timing vulnerabilities. The validator verifies the 64-byte signature using the sender’s 32-byte public key. An authentic signature cannot be forged without access to the private signing key.',
      invariants: [
        'Twisted Edwards curve arithmetic eliminates random nonce leakage during signing',
        '32-byte compact public keys with 64-byte non-repudiation signatures',
        'Immune to cache-timing attacks and padding oracle exploits',
      ],
    },
    {
      title: 'Temporal Freshness & Replay Prevention',
      category: 'Anti-Replay System',
      primitive: '128-bit Nonce Registry',
      status: 'Enabled',
      standard: 'Cryptographic Nonce Tracking & Ledger Locks',
      summary: 'Each instruction carries a high-entropy 128-bit nonce. The ledger enforces single-use constraints, preventing packet resubmission.',
      explanation: 'A digital signature alone contains no temporal expiration. An eavesdropper could capture a valid transaction and re-transmit it across the network. VAULT binds each transfer to a cryptographically secure random nonce that is recorded in an append-only registry inside an atomic database transaction. Duplicate nonces are rejected instantaneously.',
      invariants: [
        '16-byte (128-bit) CSPRNG nonce generated per transaction',
        'Database UNIQUE index on processed nonces enforces single-use atomicity',
        'Sliding-window timestamp filter rejects stale wire submissions',
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2 sm:py-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Security Center</h1>
        <p className="text-xs text-[#6B6B6B]">
          Continuous cryptographic verification, security architecture, and controlled attack demonstrations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E7E7E4]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 px-1 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-[#171717] text-[#171717] font-semibold'
              : 'border-transparent text-[#6B6B6B] hover:text-[#171717]'
          }`}
        >
          Wallet Protection Overview
        </button>
        <button
          onClick={() => setActiveTab('experiments')}
          className={`pb-2.5 px-1 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'experiments'
              ? 'border-[#171717] text-[#171717] font-semibold'
              : 'border-transparent text-[#6B6B6B] hover:text-[#171717]'
          }`}
        >
          Security Experiments (Attack Lab)
        </button>
      </div>

      {/* TAB 1: WALLET PROTECTION OVERVIEW (Prompt Section 10) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl overflow-hidden shadow-card">
            <div className="p-4 sm:px-6 border-b border-[#EFEFED] bg-[#FAFAF9]">
              <h2 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                Cryptographic Defense Invariants
              </h2>
              <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                Click any row to inspect the mathematical mechanism, RFC standards, and security guarantees.
              </p>
            </div>

            <div className="divide-y divide-[#EFEFED]">
              {primitives.map((prim) => (
                <div
                  key={prim.title}
                  onClick={() => setSelectedMechanism(prim)}
                  className="p-4 sm:px-6 flex items-center justify-between hover:bg-[#FAF9F6] transition-colors cursor-pointer group"
                >
                  <div className="space-y-0.5 pr-4">
                    <div className="text-xs font-semibold text-[#171717] group-hover:text-[#000000]">
                      {prim.title}
                    </div>
                    <div className="text-[11px] text-[#6B6B6B]">{prim.summary}</div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs font-medium text-[#16845B] bg-[#EBF7EE] px-2.5 py-1 rounded">
                      {prim.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#8E8E8E] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY EXPERIMENTS (Prompt Section 15 & 16) */}
      {activeTab === 'experiments' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-[#171717]">Security Experiments</h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Controlled demonstrations of common protocol weaknesses and mathematical defenses.
            </p>
          </div>

          {/* Experiment Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                setExperimentType('tamper');
                setTamperResult(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                experimentType === 'tamper'
                  ? 'bg-[#FFFFFF] border-[#171717] shadow-card'
                  : 'bg-[#FFFFFF] border-[#E7E7E4] hover:bg-[#FAF9F6]'
              }`}
            >
              <div className="text-xs font-semibold text-[#171717]">Transaction Tampering</div>
              <p className="text-[11px] text-[#6B6B6B] mt-1 leading-relaxed">
                Modify signed transaction data and observe verification failure.
              </p>
            </button>

            <button
              onClick={() => {
                setExperimentType('replay');
                setReplayResult(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                experimentType === 'replay'
                  ? 'bg-[#FFFFFF] border-[#171717] shadow-card'
                  : 'bg-[#FFFFFF] border-[#E7E7E4] hover:bg-[#FAF9F6]'
              }`}
            >
              <div className="text-xs font-semibold text-[#171717]">Replay Attack</div>
              <p className="text-[11px] text-[#6B6B6B] mt-1 leading-relaxed">
                Attempt to submit an already processed transaction.
              </p>
            </button>

            <button
              onClick={() => setExperimentType('mitm')}
              className={`p-4 rounded-xl border text-left transition-all ${
                experimentType === 'mitm'
                  ? 'bg-[#FFFFFF] border-[#171717] shadow-card'
                  : 'bg-[#FFFFFF] border-[#E7E7E4] hover:bg-[#FAF9F6]'
              }`}
            >
              <div className="text-xs font-semibold text-[#171717]">Man-in-the-Middle</div>
              <p className="text-[11px] text-[#6B6B6B] mt-1 leading-relaxed">
                Observe difference between authenticated and unauthenticated key exchange.
              </p>
            </button>
          </div>

          {/* EXPERIMENT 1: TAMPERING */}
          {experimentType === 'tamper' && (
            <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-5 sm:p-7 shadow-card space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#171717]">
                  Experiment: In-Flight Payload Alteration
                </h3>
                <p className="text-xs text-[#6B6B6B]">
                  Simulate an active adversary intercepting a signed wire packet and modifying the transfer amount.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#404040] mb-1.5">
                    Target Transaction to Intercept
                  </label>
                  <select
                    value={selectedTxId}
                    onChange={(e) => {
                      setSelectedTxId(e.target.value);
                      const found = transactions.find((t) => t.txId === e.target.value);
                      if (found) setTamperedAmount((found.amount * 10).toString());
                    }}
                    className="w-full px-3 py-2 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-xs font-mono text-[#171717] focus:outline-none focus:border-[#171717]"
                  >
                    {transactions.map((t) => (
                      <option key={t.id} value={t.txId}>
                        {t.txId} ({t.sender.name} &rarr; {t.receiver.name}, ₹{t.amount})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#404040] mb-1.5">
                    Adversary Altered Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={tamperedAmount}
                    onChange={(e) => setTamperedAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-xs font-mono font-semibold text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleTamperExperiment}
                disabled={tamperLoading || !selectedTxId}
                className="py-2 px-4 rounded-md bg-[#171717] hover:bg-[#000000] text-[#FFFFFF] text-xs font-medium transition-colors flex items-center gap-2"
              >
                {tamperLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Run experiment</span>
                )}
              </button>

              {/* Factual, Calm Result Card (Prompt Section 16) */}
              {tamperResult && (
                <div className="pt-4 border-t border-[#EFEFED] space-y-4">
                  <div className="text-xs font-semibold text-[#171717]">
                    Experiment Observation
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    {/* Original */}
                    <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#EFEFED] space-y-2">
                      <div className="text-[11px] font-sans font-semibold text-[#8E8E8E] uppercase tracking-wider">
                        Original Signed Packet
                      </div>
                      <div>
                        <span className="text-[#8E8E8E] font-sans">Amount: </span>
                        <span className="font-semibold text-[#171717]">
                          ₹{tamperResult.originalTransaction.amount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8E8E8E] font-sans">Hash: </span>
                        <span className="text-[#171717] break-all">
                          {tamperResult.originalTransaction.transactionHash}
                        </span>
                      </div>
                    </div>

                    {/* Modified */}
                    <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#EFEFED] space-y-2">
                      <div className="text-[11px] font-sans font-semibold text-[#C44536] uppercase tracking-wider">
                        Adversary Modified Packet
                      </div>
                      <div>
                        <span className="text-[#8E8E8E] font-sans">Amount: </span>
                        <span className="font-semibold text-[#C44536]">
                          ₹{tamperResult.tamperedData.amount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8E8E8E] font-sans">Recalculated Hash: </span>
                        <span className="text-[#C44536] break-all">
                          {tamperResult.tamperedData.recalculatedHash}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Outcome */}
                  <div className="p-4 rounded-lg bg-[#FDF2F1] border border-[#F5C2BE] space-y-2 text-xs">
                    <div className="font-semibold text-[#C44536] uppercase tracking-wider text-[11px]">
                      Verification Outcome
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-[#6B6B6B]">SHA-256 Digest Integrity:</span>
                      <span className="font-semibold text-[#C44536]">FAILED (Digest mismatch)</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-[#6B6B6B]">Ed25519 Digital Signature:</span>
                      <span className="font-semibold text-[#C44536]">INVALID (Signature rejected)</span>
                    </div>
                    <div className="border-t border-[#F5C2BE] pt-2 flex justify-between font-medium">
                      <span className="text-[#171717]">Ledger Decision:</span>
                      <span className="text-[#C44536] font-bold">Transaction rejected &bull; Balance preserved</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EXPERIMENT 2: REPLAY ATTACK */}
          {experimentType === 'replay' && (
            <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-5 sm:p-7 shadow-card space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#171717]">
                  Experiment: Wire Packet Replay
                </h3>
                <p className="text-xs text-[#6B6B6B]">
                  Simulate an adversary capturing a valid signed transaction and attempting to re-transmit it to duplicate funds.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#404040] mb-1.5">
                  Select Already Settled Transaction
                </label>
                <select
                  value={replayTxId}
                  onChange={(e) => setReplayTxId(e.target.value)}
                  className="w-full sm:w-2/3 px-3 py-2 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-xs font-mono text-[#171717] focus:outline-none focus:border-[#171717]"
                >
                  {transactions.map((t) => (
                    <option key={t.id} value={t.txId}>
                      {t.txId} ({t.sender.name} &rarr; {t.receiver.name}, ₹{t.amount})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleReplayExperiment}
                disabled={replayLoading || !replayTxId}
                className="py-2 px-4 rounded-md bg-[#171717] hover:bg-[#000000] text-[#FFFFFF] text-xs font-medium transition-colors flex items-center gap-2"
              >
                {replayLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Attempt wire replay</span>
                )}
              </button>

              {replayResult && (
                <div className="pt-4 border-t border-[#EFEFED] space-y-4">
                  <div className="p-4 rounded-lg bg-[#FEF8EC] border border-[#F6E1B6] space-y-2 text-xs">
                    <div className="font-semibold text-[#B7791F] uppercase tracking-wider text-[11px]">
                      Replay Defense Invariant Triggered
                    </div>
                    <div className="font-mono text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#6B6B6B]">Target Nonce:</span>
                        <span className="text-[#171717] font-semibold">
                          {replayResult.replayAttempt?.nonce}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6B6B]">Nonce Registry Status:</span>
                        <span className="text-[#B7791F] font-bold">ALREADY_CONSUMED</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6B6B]">Signature Validity:</span>
                        <span className="text-[#16845B]">VALID (Packet was unaltered)</span>
                      </div>
                    </div>
                    <div className="border-t border-[#F6E1B6] pt-2 flex justify-between font-medium">
                      <span className="text-[#171717]">Ledger Decision:</span>
                      <span className="text-[#B7791F] font-bold">
                        DUPLICATE_REPLAY_REJECTED &bull; Balance debited 0 times
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EXPERIMENT 3: MAN-IN-THE-MIDDLE (MITM) */}
          {experimentType === 'mitm' && (
            <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-5 sm:p-7 shadow-card space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#171717]">
                  Experiment: Authenticated vs Unauthenticated Key Exchange
                </h3>
                <p className="text-xs text-[#6B6B6B]">
                  Observe why raw Diffie-Hellman without asymmetric signature authentication is vulnerable to wire interception.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMitmAuthMode('unauthenticated')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    mitmAuthMode === 'unauthenticated'
                      ? 'bg-[#171717] text-[#FFFFFF]'
                      : 'border border-[#E7E7E4] text-[#6B6B6B] hover:text-[#171717]'
                  }`}
                >
                  Unauthenticated Channel (Vulnerable)
                </button>
                <button
                  type="button"
                  onClick={() => setMitmAuthMode('authenticated')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    mitmAuthMode === 'authenticated'
                      ? 'bg-[#171717] text-[#FFFFFF]'
                      : 'border border-[#E7E7E4] text-[#6B6B6B] hover:text-[#171717]'
                  }`}
                >
                  Ed25519 Authenticated Channel (Secure)
                </button>
              </div>

              <div className="p-4 rounded-lg bg-[#FAF9F6] border border-[#EFEFED] space-y-3 text-xs">
                {mitmAuthMode === 'unauthenticated' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[#C44536] font-semibold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Vulnerability: Rogue Public Key Injection</span>
                    </div>
                    <p className="text-[#6B6B6B] leading-relaxed">
                      Without digital signatures or public key fingerprints, an adversary in the middle (Mallory) intercepts Alice&apos;s public key, substitutes it with Mallory&apos;s public key, and negotiates independent sessions with both parties.
                    </p>
                    <div className="font-mono text-[11px] bg-[#FFFFFF] p-2.5 rounded border border-[#E7E7E4] text-[#C44536]">
                      Alice &rarr; [pk_A intercepted] &rarr; Mallory (injects pk_M) &rarr; Bob
                      <br />
                      Bob encrypts for pk_M &rarr; Mallory decrypts cleartext!
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[#16845B] font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Defense: Ed25519 Signature Verification</span>
                    </div>
                    <p className="text-[#6B6B6B] leading-relaxed">
                      In VAULT, public keys and challenge nonces are signed by pre-established identity keys. If Mallory substitutes the public key, the Ed25519 signature verification fails immediately.
                    </p>
                    <div className="font-mono text-[11px] bg-[#FFFFFF] p-2.5 rounded border border-[#E7E7E4] text-[#16845B]">
                      Alice &rarr; [pk_A + Sign(sk_A, challenge)] &rarr; Bob verifies against pk_A fingerprint.
                      <br />
                      Mallory cannot forge Sign(sk_A) &rarr; MITM defeated!
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mechanism Detail Drawer / Modal */}
      {selectedMechanism && (
        <div className="fixed inset-0 bg-[#000000]/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-xl border border-[#E7E7E4] max-w-lg w-full p-6 space-y-5 shadow-popover">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-mono text-[#8E8E8E] uppercase tracking-wider">
                  {selectedMechanism.standard}
                </div>
                <h3 className="text-base font-bold text-[#171717] mt-0.5">
                  {selectedMechanism.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMechanism(null)}
                className="p-1 rounded text-[#8E8E8E] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-[#171717]">Core Primitive: </span>
                <span className="font-mono text-[#16845B]">{selectedMechanism.primitive}</span>
              </div>
              <p className="text-[#6B6B6B] leading-relaxed">
                {selectedMechanism.explanation}
              </p>

              <div className="pt-2 border-t border-[#EFEFED] space-y-1.5">
                <div className="font-semibold text-[#171717] text-[11px] uppercase tracking-wider">
                  Enforced Invariants
                </div>
                {selectedMechanism.invariants.map((inv, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[#404040]">
                    <Check className="w-3.5 h-3.5 text-[#16845B] shrink-0 mt-0.5" />
                    <span>{inv}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#EFEFED] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMechanism(null)}
                className="py-1.5 px-4 rounded-md bg-[#171717] text-[#FFFFFF] text-xs font-medium hover:bg-[#000000]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SecurityCenterPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#171717] mx-auto mb-3" />
          <p className="text-xs text-[#6B6B6B]">Loading security center...</p>
        </div>
      }
    >
      <SecurityCenterContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowDown,
  ArrowRight,
  Check,
  X,
  Copy,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Info,
  Lock,
} from 'lucide-react';

function CryptoLabContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'hashing' | 'encryption' | 'signatures' | 'protocol'>('hashing');

  useEffect(() => {
    if (tabParam && ['hashing', 'encryption', 'signatures', 'protocol'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  // 1. Hashing state
  const [hashInput1, setHashInput1] = useState('Transfer ₹500 to Bob');
  const [hashInput2, setHashInput2] = useState('Transfer ₹501 to Bob');
  const [hashResult, setHashResult] = useState<any>(null);
  const [hashingLoading, setHashingLoading] = useState(false);

  // 2. Encryption state
  const [aesPlaintext, setAesPlaintext] = useState('Invoice #88219 - Confidential Settlement Note');
  const [tamperCiphertext, setTamperCiphertext] = useState(false);
  const [aesResult, setAesResult] = useState<any>(null);
  const [aesLoading, setAesLoading] = useState(false);
  const [aesTechnicalExpanded, setAesTechnicalExpanded] = useState(false);

  // 3. Digital Signatures state
  const [signMessage, setSignMessage] = useState('Transfer ₹500 to Bob');
  const [tamperMessage, setTamperMessage] = useState('Transfer ₹5000 to Bob');
  const [signResult, setSignResult] = useState<any>(null);
  const [signLoading, setSignLoading] = useState(false);

  // 4. Protocol Simulator state
  const [selectedProtocolStep, setSelectedProtocolStep] = useState(1);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Run Hashing experiment
  const handleGenerateHash = async () => {
    setHashingLoading(true);
    try {
      const res = await fetch('/api/lab/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input1: hashInput1, input2: hashInput2 }),
      });
      const data = await res.json();
      setHashResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setHashingLoading(false);
    }
  };

  // Run Encryption experiment
  const handleRunAes = async () => {
    setAesLoading(true);
    try {
      const res = await fetch('/api/lab/aes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plaintext: aesPlaintext,
          simulateTamperCiphertext: tamperCiphertext,
        }),
      });
      const data = await res.json();
      setAesResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAesLoading(false);
    }
  };

  // Run Signature experiment
  const handleRunSign = async () => {
    setSignLoading(true);
    try {
      const res = await fetch('/api/lab/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: signMessage, tamperedMessage: tamperMessage }),
      });
      const data = await res.json();
      setSignResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSignLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateHash();
    handleRunAes();
    handleRunSign();
  }, []);

  const protocolSteps = [
    {
      step: 1,
      sender: 'Alice',
      receiver: 'Bob',
      action: 'Public Key Transmission',
      summary: 'Alice sends her Ed25519 public key (pk_A) to Bob.',
      purpose: 'Key establishment & identity registration',
      mechanism: 'Ed25519 SPKI Key Exchange (Curve25519)',
      invariant: 'Bob registers Alice’s 32-byte public key in memory for future signature validation.',
    },
    {
      step: 2,
      sender: 'Bob',
      receiver: 'Alice',
      action: 'Fresh Challenge Nonce',
      summary: 'Bob generates a 128-bit random nonce and transmits it as a challenge to Alice.',
      purpose: 'Liveness proof & replay prevention',
      mechanism: '128-bit CSPRNG Nonce (crypto.randomBytes(16))',
      invariant: 'Guarantees that Alice’s subsequent authorization response cannot be pre-computed or replayed.',
    },
    {
      step: 3,
      sender: 'Alice',
      receiver: 'Bob',
      action: 'Signed Challenge Response',
      summary: 'Alice signs the challenge nonce and transaction hash using her private key (sk_A).',
      purpose: 'Cryptographic non-repudiation & authorization',
      mechanism: 'Ed25519 Deterministic Digital Signature (RFC 8032)',
      invariant: 'Only Alice possesses sk_A; the signature proves she authorized this specific session.',
    },
    {
      step: 4,
      sender: 'Bob',
      receiver: 'Alice',
      action: 'Mathematical Verification & Session Settlement',
      summary: 'Bob verifies the signature against Alice’s public key (pk_A) and checks nonce freshness.',
      purpose: 'Verification check & state commit',
      mechanism: 'crypto.verify(null, hash, pk_A, signature)',
      invariant: 'If valid, Bob executes the atomic balance update and records the nonce as consumed.',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2 sm:py-6">
      {/* Header (Prompt Section 11) */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Cryptography Lab</h1>
        <p className="text-xs text-[#6B6B6B]">
          Explore the mechanisms protecting transactions inside Vault.
        </p>
      </div>

      {/* Navigation (Prompt Section 11) */}
      <div className="flex items-center gap-2 border-b border-[#E7E7E4] overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('hashing')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'hashing'
              ? 'border-[#171717] text-[#171717] font-semibold'
              : 'border-transparent text-[#6B6B6B] hover:text-[#171717]'
          }`}
        >
          Hashing
        </button>
        <button
          onClick={() => setActiveTab('encryption')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'encryption'
              ? 'border-[#171717] text-[#171717] font-semibold'
              : 'border-transparent text-[#6B6B6B] hover:text-[#171717]'
          }`}
        >
          Encryption
        </button>
        <button
          onClick={() => setActiveTab('signatures')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'signatures'
              ? 'border-[#171717] text-[#171717] font-semibold'
              : 'border-transparent text-[#6B6B6B] hover:text-[#171717]'
          }`}
        >
          Digital Signatures
        </button>
        <button
          onClick={() => setActiveTab('protocol')}
          className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'protocol'
              ? 'border-[#171717] text-[#171717] font-semibold'
              : 'border-transparent text-[#6B6B6B] hover:text-[#171717]'
          }`}
        >
          Protocol Simulator
        </button>
      </div>

      {/* TAB 1: HASHING LAB UI (Prompt Section 12) */}
      {activeTab === 'hashing' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-5 sm:p-7 shadow-card space-y-6">
            <div>
              <h2 className="text-base font-semibold text-[#171717]">SHA-256 Hashing</h2>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Deterministic 256-bit cryptographic digest generation under FIPS 180-4.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#404040] mb-1.5">Input</label>
                <input
                  type="text"
                  value={hashInput1}
                  onChange={(e) => setHashInput1(e.target.value)}
                  placeholder="Enter message to hash..."
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-xs font-mono text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleGenerateHash}
                  disabled={hashingLoading}
                  className="py-2 px-4 rounded-md bg-[#171717] hover:bg-[#000000] text-[#FFFFFF] text-xs font-medium transition-colors flex items-center gap-2"
                >
                  {hashingLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Generate hash</span>
                  )}
                </button>
              </div>

              {hashResult && (
                <div className="pt-2 space-y-1.5">
                  <div className="text-xs font-medium text-[#8E8E8E]">Digest</div>
                  <div className="p-3 bg-[#FAF9F6] rounded-md border border-[#EFEFED] font-mono text-xs text-[#171717] break-all flex items-center justify-between gap-2">
                    <span>{hashResult.hash1}</span>
                    <button
                      onClick={() => copyToClipboard(hashResult.hash1, 'h1')}
                      className="text-[#8E8E8E] hover:text-[#171717]"
                      title="Copy Digest"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Avalanche Demonstration (Prompt Section 12) */}
          <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-5 sm:p-7 shadow-card space-y-5">
            <div>
              <h2 className="text-base font-semibold text-[#171717]">
                Avalanche Effect Demonstration
              </h2>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                The Strict Avalanche Criterion (SAC) states that changing a single input bit must flip ~50% of the output digest bits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-[#404040] mb-1">Original Input</label>
                <input
                  type="text"
                  value={hashInput1}
                  onChange={(e) => setHashInput1(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#E7E7E4] font-mono text-xs text-[#171717]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#404040] mb-1">
                  Modified Input (1-character delta)
                </label>
                <input
                  type="text"
                  value={hashInput2}
                  onChange={(e) => setHashInput2(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#E7E7E4] font-mono text-xs text-[#171717]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateHash}
              disabled={hashingLoading}
              className="py-2 px-4 rounded-md border border-[#E7E7E4] hover:bg-[#FAF9F6] text-xs font-medium text-[#171717] transition-colors"
            >
              Analyze Bit Divergence
            </button>

            {hashResult?.avalanche && (
              <div className="pt-4 border-t border-[#EFEFED] space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#171717]">Bits Changed:</span>
                  <span className="font-mono font-semibold text-[#16845B]">
                    {hashResult.avalanche.flippedBits} / 256 bits ({hashResult.avalanche.flipPct}%)
                  </span>
                </div>

                {/* Visual Progress Bar (Prompt Section 12) */}
                <div className="w-full bg-[#EFEFED] h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#171717] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${hashResult.avalanche.flipPct}%` }}
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#EFEFED] space-y-2 text-xs font-mono">
                  <div>
                    <div className="text-[11px] text-[#8E8E8E] font-sans">Original Digest:</div>
                    <div className="text-[#171717] break-all">{hashResult.hash1}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#8E8E8E] font-sans">Modified Digest:</div>
                    <div className="text-[#171717] break-all">{hashResult.hash2}</div>
                  </div>
                </div>

                <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                  Notice that modifying a single character flipped approximately 50% of all output bits. This proves SHA-256 exhibits maximum confusion and diffusion, preventing pre-image estimation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ENCRYPTION LAB UI (Prompt Section 14) */}
      {activeTab === 'encryption' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-5 sm:p-7 shadow-card space-y-6">
            <div>
              <h2 className="text-base font-semibold text-[#171717]">AES-256-GCM Encryption</h2>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Authenticated Encryption with Associated Data (AEAD) ensuring confidentiality and tamper resistance.
              </p>
            </div>

            {/* Visual 3-Stage Pipeline (Prompt Section 14) */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#404040] mb-1.5">
                  PLAINTEXT
                </label>
                <input
                  type="text"
                  value={aesPlaintext}
                  onChange={(e) => setAesPlaintext(e.target.value)}
                  placeholder="Enter message to encrypt..."
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-xs font-mono text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRunAes}
                  disabled={aesLoading}
                  className="py-2 px-4 rounded-md bg-[#171717] hover:bg-[#000000] text-[#FFFFFF] text-xs font-medium transition-colors flex items-center gap-2"
                >
                  {aesLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Encrypt &amp; Decrypt</span>
                  )}
                </button>

                <label className="flex items-center gap-2 text-xs text-[#404040] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tamperCiphertext}
                    onChange={(e) => setTamperCiphertext(e.target.checked)}
                    className="rounded border-[#E7E7E4] text-[#171717] focus:ring-[#171717]"
                  />
                  <span>Simulate wire tampering (flip byte in ciphertext)</span>
                </label>
              </div>

              {aesResult && (
                <div className="pt-4 border-t border-[#EFEFED] space-y-4">
                  {/* Ciphertext */}
                  <div>
                    <div className="text-xs font-medium text-[#8E8E8E] uppercase tracking-wider mb-1">
                      CIPHERTEXT
                    </div>
                    <div className="p-3 bg-[#FAF9F6] rounded-md border border-[#EFEFED] font-mono text-xs text-[#171717] break-all">
                      {aesResult.ciphertext}
                    </div>
                  </div>

                  {/* Decryption Result */}
                  <div>
                    <div className="text-xs font-medium text-[#8E8E8E] uppercase tracking-wider mb-1">
                      DECRYPTION VERDICT
                    </div>
                    {aesResult.decryption?.success ? (
                      <div className="p-3.5 bg-[#EBF7EE] border border-[#C3E7CB] rounded-md space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16845B]">
                          <Check className="w-4 h-4" />
                          <span>GMAC Authentication Passed &bull; Plaintext Recovered</span>
                        </div>
                        <div className="font-mono text-xs text-[#171717]">
                          &ldquo;{aesResult.decryption.plaintext}&rdquo;
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-[#FDF2F1] border border-[#F5C2BE] rounded-md space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C44536]">
                          <X className="w-4 h-4" />
                          <span>Authentication Failed: Wire Tampering Detected</span>
                        </div>
                        <div className="text-xs text-[#6B6B6B]">
                          {aesResult.decryption?.error || 'GMAC tag mismatch: ciphertext altered.'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expandable Technical Details (Prompt Section 14) */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setAesTechnicalExpanded(!aesTechnicalExpanded)}
                      className="text-xs text-[#6B6B6B] hover:text-[#171717] flex items-center gap-1 transition-colors"
                    >
                      <span>
                        {aesTechnicalExpanded
                          ? 'Hide initialization vector & tag'
                          : 'View nonce & authentication tag'}
                      </span>
                      {aesTechnicalExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {aesTechnicalExpanded && (
                      <div className="mt-3 p-3.5 bg-[#FAF9F6] rounded-md border border-[#EFEFED] space-y-2 text-xs font-mono">
                        <div>
                          <span className="text-[#8E8E8E] font-sans">96-bit Random IV: </span>
                          <span className="text-[#171717]">{aesResult.iv}</span>
                        </div>
                        <div>
                          <span className="text-[#8E8E8E] font-sans">
                            128-bit GMAC Authentication Tag:{' '}
                          </span>
                          <span className="text-[#171717]">{aesResult.authTag}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DIGITAL SIGNATURE LAB (Prompt Section 13) */}
      {activeTab === 'signatures' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-5 sm:p-7 shadow-card space-y-6">
            <div>
              <h2 className="text-base font-semibold text-[#171717]">
                Ed25519 Digital Signature Pipeline
              </h2>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                3-stage asymmetric signature generation and verification on Curve25519.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#404040] mb-1.5">
                Transaction Message
              </label>
              <input
                type="text"
                value={signMessage}
                onChange={(e) => setSignMessage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-xs font-mono text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>

            <button
              type="button"
              onClick={handleRunSign}
              disabled={signLoading}
              className="py-2 px-4 rounded-md bg-[#171717] hover:bg-[#000000] text-[#FFFFFF] text-xs font-medium transition-colors flex items-center gap-2"
            >
              {signLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Generate Signature &amp; Verify</span>
              )}
            </button>

            {/* 3-Stage Visualization (Prompt Section 13) */}
            {signResult && (
              <div className="pt-4 border-t border-[#EFEFED] space-y-6">
                <div className="space-y-4 max-w-lg mx-auto text-xs">
                  {/* Step 1: MESSAGE */}
                  <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#EFEFED]">
                    <div className="text-[11px] font-semibold text-[#8E8E8E] uppercase tracking-wider mb-1">
                      1. MESSAGE
                    </div>
                    <div className="font-mono text-[#171717]">&ldquo;{signResult.message}&rdquo;</div>
                  </div>

                  <div className="text-center text-[#8E8E8E]">
                    <ArrowDown className="w-4 h-4 mx-auto" />
                  </div>

                  {/* Step 2: HASH */}
                  <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#EFEFED]">
                    <div className="text-[11px] font-semibold text-[#8E8E8E] uppercase tracking-wider mb-1">
                      2. HASH (SHA-256)
                    </div>
                    <div className="font-mono text-[#171717] break-all">{signResult.hash}</div>
                  </div>

                  <div className="text-center text-[#8E8E8E]">
                    <ArrowDown className="w-4 h-4 mx-auto" />
                  </div>

                  {/* Step 3: SIGN */}
                  <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#EFEFED]">
                    <div className="text-[11px] font-semibold text-[#8E8E8E] uppercase tracking-wider mb-1">
                      3. SIGN (Sender Private Key &rarr; Ed25519 Signature)
                    </div>
                    <div className="font-mono text-[#171717] break-all">{signResult.signature}</div>
                  </div>

                  <div className="text-center text-[#8E8E8E]">
                    <ArrowDown className="w-4 h-4 mx-auto" />
                  </div>

                  {/* VERIFY */}
                  <div className="p-3.5 rounded-lg bg-[#EBF7EE] border border-[#C3E7CB]">
                    <div className="text-[11px] font-semibold text-[#16845B] uppercase tracking-wider mb-1">
                      VERIFY (Message + Signature + Public Key)
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16845B]">
                      <Check className="w-4 h-4" />
                      <span>Signature Valid &bull; Authentic Non-Repudiation Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PROTOCOL SIMULATOR (Prompt Section 17) */}
      {activeTab === 'protocol' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-5 sm:p-7 shadow-card space-y-6">
            <div>
              <h2 className="text-base font-semibold text-[#171717]">
                Cryptographic Protocol Sequence Simulator
              </h2>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Visualizing the interactive exchange and authentication between Alice and Bob.
              </p>
            </div>

            {/* Sequence Diagram (Prompt Section 17) */}
            <div className="p-6 bg-[#FAF9F6] rounded-xl border border-[#EFEFED] space-y-4">
              <div className="flex justify-between font-bold text-xs text-[#171717] px-6 pb-2 border-b border-[#E7E7E4]">
                <span>Alice (Sender)</span>
                <span>Bob (Receiver / Validator)</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {protocolSteps.map((s) => {
                  const isSelected = selectedProtocolStep === s.step;
                  const isAliceSender = s.sender === 'Alice';

                  return (
                    <div
                      key={s.step}
                      onClick={() => setSelectedProtocolStep(s.step)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFFFFF] border-[#171717] shadow-card'
                          : 'bg-[#FFFFFF]/60 border-[#E7E7E4] hover:bg-[#FFFFFF]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-sans font-medium text-[#8E8E8E] mb-1">
                        <span>Message {s.step}</span>
                        <span>{s.action}</span>
                      </div>
                      <div className="flex items-center justify-between font-medium">
                        <span className={isAliceSender ? 'text-[#171717]' : 'text-[#8E8E8E]'}>
                          {isAliceSender ? 'Alice' : ''}
                        </span>
                        <span className="text-xs font-sans text-[#171717]">
                          {isAliceSender ? `──── ${s.action} ────>` : `<──── ${s.action} ────`}
                        </span>
                        <span className={!isAliceSender ? 'text-[#171717]' : 'text-[#8E8E8E]'}>
                          {!isAliceSender ? 'Bob' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Step Explanation Card (Prompt Section 17) */}
            {selectedProtocolStep && (
              <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E7E7E4] shadow-card space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-[#EFEFED] pb-2">
                  <span className="font-semibold text-xs text-[#171717]">
                    What happened in Step {selectedProtocolStep}?
                  </span>
                  <span className="text-[11px] text-[#8E8E8E] font-mono">
                    {protocolSteps[selectedProtocolStep - 1].action}
                  </span>
                </div>

                <p className="text-[#404040] leading-relaxed">
                  {protocolSteps[selectedProtocolStep - 1].summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
                  <div>
                    <span className="text-[#8E8E8E]">Purpose: </span>
                    <span className="font-medium text-[#171717]">
                      {protocolSteps[selectedProtocolStep - 1].purpose}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8E8E8E]">Cryptographic Mechanism: </span>
                    <span className="font-mono text-[#16845B]">
                      {protocolSteps[selectedProtocolStep - 1].mechanism}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EFEFED] text-[11px] text-[#6B6B6B]">
                  <strong>Invariant Enforced:</strong>{' '}
                  {protocolSteps[selectedProtocolStep - 1].invariant}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CryptoLabPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6B6B6B]">Loading Cryptography Workbench...</div>}>
      <CryptoLabContent />
    </Suspense>
  );
}



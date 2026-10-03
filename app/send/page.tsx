'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ShieldCheck,
  Lock,
  ExternalLink,
} from 'lucide-react';

export default function SendPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Steps: 1 = Details, 2 = Review, 3 = Processing / Complete
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [processingStage, setProcessingStage] = useState(0);
  const [settledTx, setSettledTx] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setCurrentUser(data.user);
        }
      });

    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) {
          setUsers(data.users);
        }
      });
  }, [router]);

  const selectedReceiver = users.find((u) => u.id === receiverId);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverId) {
      setError('Please select a recipient.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive transfer amount.');
      return;
    }
    if (currentUser?.wallet && currentUser.wallet.balance < numAmount) {
      setError(
        `Insufficient balance: Available is ₹${currentUser.wallet.balance.toFixed(2)}, required ₹${numAmount.toFixed(2)}.`
      );
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleConfirmAndSign = async () => {
    setStep(3);
    setProcessingStage(1); // Stage 1: Creating transaction
    setError(null);

    try {
      // Simulate step progression visually for educational clarity
      setTimeout(() => setProcessingStage(2), 300); // Stage 2: Hash & Signature
      setTimeout(() => setProcessingStage(3), 600); // Stage 3: Security checks

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          amount: parseFloat(amount),
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        if (res.ok) {
          setProcessingStage(4); // Stage 4: Settled
          setSettledTx(data.transaction);
        } else {
          setError(data.error || 'Transaction settlement failed');
          setStep(2);
        }
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Network communication error');
      setStep(2);
    }
  };

  return (
    <div className="max-w-[480px] mx-auto py-6 sm:py-10">
      {/* Back button */}
      {step === 1 && (
        <Link
          href="/wallet"
          className="inline-flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#171717] mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to wallet</span>
        </Link>
      )}

      {/* STEP 1: Compose Payment */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Send money</h1>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Authorized via Ed25519 digital signature and canonical SHA-256 verification.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-6 sm:p-7 shadow-card">
            {error && (
              <div className="mb-4 p-3 rounded-md bg-[#FDF2F1] border border-[#F5C2BE] text-xs text-[#C44536]">
                {error}
              </div>
            )}

            <form onSubmit={handleContinue} className="space-y-5">
              {/* Recipient Selector */}
              <div>
                <label className="block text-xs font-medium text-[#404040] mb-1.5">
                  Recipient
                </label>
                <select
                  required
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-sm text-[#171717] focus:outline-none focus:border-[#171717] transition-colors"
                >
                  <option value="">Select registered recipient...</option>
                  {users
                    .filter((u) => u.id !== currentUser?.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#404040]">Amount</label>
                  {currentUser?.wallet && (
                    <span className="text-[11px] text-[#6B6B6B]">
                      Available: ₹{currentUser.wallet.balance.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-[#6B6B6B]">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500.00"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-sm font-semibold text-[#171717] placeholder-[#8E8E8E] focus:outline-none focus:border-[#171717] transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Optional Confidential Memo */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#404040]">
                    Confidential Note (Optional)
                  </label>
                  <span className="text-[11px] font-mono text-[#8E8E8E] flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-[#16845B]" />
                    <span>AES-256-GCM Encrypted</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Project consultation payment"
                  maxLength={100}
                  className="w-full px-3.5 py-2 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-xs text-[#171717] placeholder-[#8E8E8E] focus:outline-none focus:border-[#171717] transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-md bg-[#171717] hover:bg-[#000000] text-[#FFFFFF] text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STEP 2: Review Transaction */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Review transaction</h1>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Verify destination details before generating asymmetric authorization signature.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-6 sm:p-7 shadow-card space-y-5">
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-2 border-b border-[#EFEFED]">
                <span className="text-[#6B6B6B]">From</span>
                <span className="font-semibold text-[#171717]">{currentUser?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#EFEFED]">
                <span className="text-[#6B6B6B]">To</span>
                <span className="font-semibold text-[#171717]">
                  {selectedReceiver?.name} ({selectedReceiver?.email})
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#EFEFED]">
                <span className="text-[#6B6B6B]">Transfer Amount</span>
                <span className="font-bold text-sm text-[#171717] font-mono">
                  ₹{parseFloat(amount).toFixed(2)}
                </span>
              </div>
              {note && (
                <div className="flex justify-between py-2 border-b border-[#EFEFED]">
                  <span className="text-[#6B6B6B]">Confidential Memo</span>
                  <span className="text-[#171717] italic">{note}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-[#EFEFED]">
                <span className="text-[#6B6B6B]">Network / Protocol</span>
                <span className="text-[#171717]">Internal secure transfer</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#6B6B6B]">Cryptographic Authorization</span>
                <span className="font-mono text-[11px] text-[#16845B] font-medium">
                  Ed25519 &bull; Curve25519
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 px-4 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] hover:bg-[#FAF9F6] text-xs font-medium text-[#171717] transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSign}
                className="w-2/3 py-2.5 px-4 rounded-md bg-[#171717] hover:bg-[#000000] text-[#FFFFFF] text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-[#16845B]" />
                <span>Confirm &amp; Sign</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Cryptographic Pipeline Progression & Result */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-6 sm:p-8 shadow-card space-y-6">
            {processingStage < 4 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-[#171717]">
                    Preparing transaction
                  </h2>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    Executing cryptographic pipeline and non-repudiation checks...
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-2.5 text-[#171717]">
                    {processingStage >= 1 ? (
                      <Check className="w-4 h-4 text-[#16845B]" />
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin text-[#8E8E8E]" />
                    )}
                    <span>Transaction created &amp; canonicalized</span>
                  </div>

                  <div
                    className={`flex items-center gap-2.5 ${
                      processingStage >= 2 ? 'text-[#171717]' : 'text-[#8E8E8E]'
                    }`}
                  >
                    {processingStage >= 2 ? (
                      <Check className="w-4 h-4 text-[#16845B]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#D4D4D0]" />
                    )}
                    <span>Integrity hash generated (SHA-256)</span>
                  </div>

                  <div
                    className={`flex items-center gap-2.5 ${
                      processingStage >= 3 ? 'text-[#171717]' : 'text-[#8E8E8E]'
                    }`}
                  >
                    {processingStage >= 3 ? (
                      <Check className="w-4 h-4 text-[#16845B]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#D4D4D0]" />
                    )}
                    <span>Digital signature created (Ed25519)</span>
                  </div>

                  <div
                    className={`flex items-center gap-2.5 ${
                      processingStage >= 4 ? 'text-[#171717]' : 'text-[#8E8E8E]'
                    }`}
                  >
                    {processingStage >= 4 ? (
                      <Check className="w-4 h-4 text-[#16845B]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#D4D4D0]" />
                    )}
                    <span>Anti-replay verification passed</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="w-10 h-10 rounded-full bg-[#EBF7EE] text-[#16845B] flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-medium text-[#16845B] uppercase tracking-wider">
                    Transaction Settled
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-[#171717] font-mono">
                    ₹{parseFloat(amount).toFixed(2)}
                  </div>
                  <p className="text-xs text-[#6B6B6B]">
                    Successfully transferred to {selectedReceiver?.name}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#EFEFED] text-xs font-mono text-left space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#8E8E8E]">Transaction ID</span>
                    <span className="text-[#171717] font-semibold">{settledTx?.txId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8E8E]">Status</span>
                    <span className="text-[#16845B] font-medium">✓ Cryptographically Verified</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {settledTx?.id && (
                    <Link
                      href={`/transactions/${settledTx.id}`}
                      className="w-full py-2.5 px-4 rounded-md bg-[#171717] hover:bg-[#000000] text-[#FFFFFF] text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View Cryptographic Audit Record</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <Link
                    href="/wallet"
                    className="w-full py-2 px-4 rounded-md border border-[#E7E7E4] hover:bg-[#FAF9F6] text-xs font-medium text-[#171717] transition-colors block"
                  >
                    Return to Wallet
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


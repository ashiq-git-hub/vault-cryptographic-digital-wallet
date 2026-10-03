'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  ShieldCheck,
  Check,
  ChevronRight,
  Loader2,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface Transaction {
  id: string;
  txId: string;
  amount: number;
  status: string;
  timestamp: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender: { id: string; name: string; email: string };
  receiver: { id: string; name: string; email: string };
  transactionHash: string;
  signature: string;
}

interface WalletData {
  user: { id: string; name: string; email: string };
  wallet: { balance: number; currency: string; updatedAt: string };
  security: {
    passwordKdf: string;
    signatureAlgorithm: string;
    publicKeyFingerprint: string;
    encryptionAlgorithm: string;
    hashingAlgorithm: string;
    replayProtection: string;
    integrityVerification: string;
  };
  recentTransactions: Transaction[];
}

export default function WalletPage() {
  const router = useRouter();
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wallet');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const copyFingerprint = () => {
    if (!data?.security.publicKeyFingerprint) return;
    navigator.clipboard.writeText(data.security.publicKeyFingerprint);
    setCopiedFingerprint(true);
    setTimeout(() => setCopiedFingerprint(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#171717] mx-auto mb-3" />
        <p className="text-xs text-[#6B6B6B]">Loading secure wallet state...</p>
      </div>
    );
  }

  if (!data) return null;

  const { user, wallet, security, recentTransactions } = data;

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-2 sm:py-6">
      {/* Top Greeting & Balance Area */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-sm text-[#6B6B6B]">
              {getGreeting()}, {user.name}
            </div>
            <div className="text-xs text-[#8E8E8E] font-mono mt-0.5 flex items-center gap-1.5">
              <span>{user.email}</span>
              <span>&bull;</span>
              <button
                onClick={copyFingerprint}
                className="hover:text-[#171717] transition-colors flex items-center gap-1"
                title="Click to copy Public Key Fingerprint"
              >
                <span>Key: {security.publicKeyFingerprint.slice(0, 14)}...</span>
                {copiedFingerprint ? (
                  <Check className="w-3 h-3 text-[#16845B]" />
                ) : (
                  <Copy className="w-3 h-3 text-[#8E8E8E]" />
                )}
              </button>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF7EE] text-[#16845B] text-xs font-medium self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16845B]" />
            <span>Cryptographically Verified</span>
          </div>
        </div>

        {/* Hero Balance Box */}
        <div className="pt-4 pb-2">
          <div className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider">
            Available Balance
          </div>
          <div className="text-4xl sm:text-5xl font-bold tracking-tight text-[#171717] mt-1">
            {formatCurrency(wallet.balance)}
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/send"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#171717] hover:bg-[#000000] text-[#FFFFFF] text-sm font-medium transition-colors shadow-subtle"
          >
            <Send className="w-4 h-4" />
            <span>Send money</span>
          </Link>

          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#FFFFFF] hover:bg-[#FAF9F6] border border-[#E7E7E4] text-[#171717] text-sm font-medium transition-colors shadow-subtle"
          >
            <span>Activity ledger</span>
          </Link>

          <Link
            href="/crypto-lab"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-[#6B6B6B] hover:text-[#171717] text-sm font-medium transition-colors"
          >
            <span>Open Lab &rarr;</span>
          </Link>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-[#E7E7E4]" />

      {/* Recent Activity Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#171717]">Recent activity</h2>
          <Link
            href="/transactions"
            className="text-xs font-medium text-[#6B6B6B] hover:text-[#171717] flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions && recentTransactions.length > 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl overflow-hidden divide-y divide-[#EFEFED] shadow-card">
            {recentTransactions.slice(0, 6).map((tx) => {
              const isSender = tx.senderId === user.id;
              const counterparty = isSender ? tx.receiver.name : tx.sender.name;
              const prefix = isSender ? '-' : '+';
              const directionLabel = isSender ? `To ${counterparty}` : `From ${counterparty}`;

              return (
                <Link
                  key={tx.id}
                  href={`/transactions/${tx.id}`}
                  className="p-4 sm:px-5 flex items-center justify-between hover:bg-[#FAF9F6] transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isSender ? 'bg-[#F2F2EE] text-[#404040]' : 'bg-[#EBF7EE] text-[#16845B]'
                      }`}
                    >
                      {isSender ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#171717] group-hover:text-[#000000] truncate">
                        {directionLabel}
                      </div>
                      <div className="text-xs text-[#8E8E8E] font-mono flex items-center gap-2 mt-0.5">
                        <span>{tx.txId}</span>
                        <span>&bull;</span>
                        <span>{formatDate(tx.createdAt || tx.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-semibold font-mono ${
                        isSender ? 'text-[#171717]' : 'text-[#16845B]'
                      }`}
                    >
                      {prefix}
                      {formatCurrency(tx.amount)}
                    </div>
                    <div className="text-[11px] text-[#16845B] font-medium flex items-center justify-end gap-1 mt-0.5">
                      <Check className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-8 text-center space-y-3 shadow-card">
            <div className="text-sm font-semibold text-[#171717]">No transactions yet</div>
            <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
              Your verified transactions will appear here once executed and settled with Ed25519 signatures.
            </p>
            <Link
              href="/send"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#171717] text-[#FFFFFF] text-xs font-medium hover:bg-[#000000] transition-colors"
            >
              <span>Send money</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* Divider */}
      <hr className="border-[#E7E7E4]" />

      {/* Security Protection Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#171717]">Wallet protection</h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Your transactions and keys are secured through continuous cryptographic enforcement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E7E7E4] shadow-card space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171717]">
              <Check className="w-3.5 h-3.5 text-[#16845B]" />
              <span>Encrypted Storage</span>
            </div>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Private keys and transaction notes are encrypted with AES-256-GCM using authenticated 128-bit GMAC tags.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E7E7E4] shadow-card space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171717]">
              <Check className="w-3.5 h-3.5 text-[#16845B]" />
              <span>Transaction Signatures</span>
            </div>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Every instruction is signed on Curve25519 with Ed25519, guaranteeing absolute mathematical non-repudiation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E7E7E4] shadow-card space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171717]">
              <Check className="w-3.5 h-3.5 text-[#16845B]" />
              <span>Integrity Verification</span>
            </div>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Deterministic SHA-256 hashing prevents wire alterations; unique nonces protect against packet replay.
            </p>
          </div>
        </div>

        <div className="pt-1">
          <Link
            href="/security"
            className="text-xs font-medium text-[#171717] hover:underline inline-flex items-center gap-1"
          >
            <span>Review full Security Architecture &amp; Experiments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}


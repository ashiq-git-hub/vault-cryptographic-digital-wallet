'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setUser(data.user);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleResetDemoState = async () => {
    if (!confirm('Reset all demo transactions, balances, and keys to initial seed evaluation state?')) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 3000);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#171717] mx-auto mb-3" />
        <p className="text-xs text-[#6B6B6B]">Loading account profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/wallet"
          className="inline-flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#171717] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to wallet</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Profile &amp; Keys</h1>
        <p className="text-xs text-[#6B6B6B]">
          Identity credentials, asymmetric public key management, and cryptographic envelope settings.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-5 sm:p-6 shadow-card space-y-4">
        <h2 className="text-xs font-semibold text-[#8E8E8E] uppercase tracking-wider border-b border-[#EFEFED] pb-2">
          Account Identification
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-[#8E8E8E]">Full Name</div>
            <div className="font-semibold text-[#171717] mt-0.5">{user.name}</div>
          </div>

          <div>
            <div className="text-[#8E8E8E]">Email Address</div>
            <div className="font-medium text-[#171717] mt-0.5 font-mono">{user.email}</div>
          </div>

          <div>
            <div className="text-[#8E8E8E]">Simulated Ledger Balance</div>
            <div className="font-bold text-sm text-[#171717] font-mono mt-0.5">
              ₹{user.wallet?.balance?.toFixed(2) || '0.00'}
            </div>
          </div>

          <div>
            <div className="text-[#8E8E8E]">Internal Account ID</div>
            <div className="font-mono text-[#8E8E8E] mt-0.5 text-[11px] truncate">
              {user.id}
            </div>
          </div>
        </div>
      </div>

      {/* Public Key Card */}
      <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFEFED] pb-2">
          <h2 className="text-xs font-semibold text-[#8E8E8E] uppercase tracking-wider">
            Asymmetric Public Key (Ed25519)
          </h2>
          <span className="text-[11px] font-mono text-[#16845B] bg-[#EBF7EE] px-2 py-0.5 rounded">
            Active Keypair
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Fingerprint */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#8E8E8E]">
              <span>SHA-256 Public Key Fingerprint</span>
              <button
                onClick={() =>
                  copyToClipboard(user.publicKey?.fingerprint || '', 'fp')
                }
                className="hover:text-[#171717] flex items-center gap-1 font-mono"
              >
                <span>{copiedKey === 'fp' ? 'Copied' : 'Copy'}</span>
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <div className="p-2.5 bg-[#FAF9F6] rounded border border-[#EFEFED] font-mono text-[11px] text-[#171717] break-all">
              {user.publicKey?.fingerprint || 'Not Available'}
            </div>
          </div>

          {/* SPKI PEM */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] text-[#8E8E8E]">
              <span>SPKI Public Key (DER/PEM)</span>
              <button
                onClick={() =>
                  copyToClipboard(user.publicKey?.publicKeyPem || '', 'pem')
                }
                className="hover:text-[#171717] flex items-center gap-1 font-mono"
              >
                <span>{copiedKey === 'pem' ? 'Copied' : 'Copy'}</span>
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <pre className="p-3 bg-[#FAF9F6] rounded border border-[#EFEFED] font-mono text-[11px] text-[#171717] whitespace-pre-wrap break-all max-h-36 overflow-y-auto">
              {user.publicKey?.publicKeyPem || 'Not Available'}
            </pre>
          </div>
        </div>
      </div>

      {/* Keystore Security Note */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E7E7E4] shadow-card space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[#171717]">
          <Lock className="w-3.5 h-3.5 text-[#16845B]" />
          <span>Server-Side Envelope Encryption</span>
        </div>
        <p className="text-[#6B6B6B] leading-relaxed">
          Your private signing key is never exposed to the client application or browser storage. It is stored in the database enveloped under AES-256-GCM and decrypted exclusively in volatile memory during transaction authorization.
        </p>
      </div>

      {/* Demo State Control */}
      <div className="pt-2 flex items-center justify-between text-xs">
        <div>
          <div className="font-semibold text-[#171717]">Reset Evaluation State</div>
          <div className="text-[#8E8E8E]">Restores default ₹10,000 balances and pre-seeded keys.</div>
        </div>

        <button
          type="button"
          onClick={handleResetDemoState}
          disabled={resetting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] hover:bg-[#FAF9F6] text-xs font-medium text-[#B7791F] transition-colors"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting...' : 'Reset demo ledger'}</span>
        </button>
      </div>

      {resetSuccess && (
        <div className="p-3 rounded-md bg-[#EBF7EE] border border-[#C3E7CB] text-xs text-[#16845B] text-center font-medium">
          Demo ledger and balances reset to clean initial evaluation state.
        </div>
      )}
    </div>
  );
}


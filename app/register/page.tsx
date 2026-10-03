'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push('/wallet');
        router.refresh();
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[440px] mx-auto py-12 px-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#171717] text-[#FFFFFF] font-bold text-base tracking-wider mb-4">
          V
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Create your Vault</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Initializes an Ed25519 keypair and simulated ledger account.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-6 sm:p-8 shadow-card">
        {error && (
          <div className="mb-5 p-3 rounded-md bg-[#FDF2F1] border border-[#F5C2BE] text-xs text-[#C44536]">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#404040] mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. David Miller"
              className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-sm text-[#171717] placeholder-[#8E8E8E] focus:outline-none focus:border-[#171717] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#404040] mb-1.5">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="david@wallet.secure"
              className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-sm text-[#171717] placeholder-[#8E8E8E] focus:outline-none focus:border-[#171717] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#404040] mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-sm text-[#171717] placeholder-[#8E8E8E] focus:outline-none focus:border-[#171717] transition-colors"
            />
          </div>

          {/* Cryptographic Provisioning Checklist */}
          <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#EFEFED] text-xs text-[#6B6B6B] space-y-1.5">
            <div className="font-medium text-[#171717] text-[11px] uppercase tracking-wider mb-1">
              Account Provisioning Security
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#16845B]" />
              <span>Ed25519 Curve25519 signing keypair generation</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#16845B]" />
              <span>AES-256-GCM encrypted private key envelope</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#16845B]" />
              <span>Initial simulated balance allocation (&#8377;10,000)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md bg-[#171717] hover:bg-[#000000] text-[#FFFFFF] text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Create wallet</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center text-xs text-[#6B6B6B]">
        Already have a wallet?{' '}
        <Link href="/login" className="font-medium text-[#171717] hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}


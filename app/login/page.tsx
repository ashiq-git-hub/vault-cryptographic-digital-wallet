'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    { name: 'Alice', email: 'alice@wallet.secure', balance: '₹10,000', role: 'Sender' },
    { name: 'Bob', email: 'bob@wallet.secure', balance: '₹7,500', role: 'Receiver' },
    { name: 'Charlie', email: 'charlie@wallet.secure', balance: '₹5,000', role: 'Merchant' },
    { name: 'Ashiq', email: 'ashiq@wallet.secure', balance: '₹12,000', role: 'Auditor' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push('/wallet');
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail }),
      });
      if (res.ok) {
        router.push('/wallet');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Quick login failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[420px] mx-auto py-12 px-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#171717] text-[#FFFFFF] font-bold text-base tracking-wider mb-4">
          V
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">VAULT</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">Your wallet, secured.</p>
      </div>

      {/* Login Card */}
      <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-6 sm:p-8 shadow-card">
        {error && (
          <div className="mb-5 p-3 rounded-md bg-[#FDF2F1] border border-[#F5C2BE] text-xs text-[#C44536]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#404040] mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@wallet.secure"
              className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-sm text-[#171717] placeholder-[#8E8E8E] focus:outline-none focus:border-[#171717] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#404040]">Password</label>
              <span className="text-[11px] text-[#8E8E8E]">Default: password123</span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-sm text-[#171717] placeholder-[#8E8E8E] focus:outline-none focus:border-[#171717] transition-colors"
            />
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
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#EFEFED] text-center text-[12px] text-[#8E8E8E]">
          Protected by PBKDF2-HMAC-SHA512 key derivation
        </div>
      </div>

      {/* Evaluator Quick Persona Switcher */}
      <div className="mt-8">
        <div className="text-center mb-3">
          <span className="text-xs font-medium text-[#8E8E8E] uppercase tracking-wider">
            Evaluation Quick Access
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => handleQuickLogin(acc.email)}
              disabled={loading}
              className="p-3 text-left rounded-lg bg-[#FFFFFF] border border-[#E7E7E4] hover:border-[#171717] hover:bg-[#FAFAF9] transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#171717] group-hover:text-[#000000]">
                  {acc.name}
                </span>
                <span className="text-[11px] font-mono text-[#16845B] font-medium">
                  {acc.balance}
                </span>
              </div>
              <div className="text-[11px] text-[#8E8E8E] mt-0.5">{acc.role}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Create Account Link */}
      <div className="mt-6 text-center text-xs text-[#6B6B6B]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-[#171717] hover:underline">
          Create wallet
        </Link>
      </div>
    </div>
  );
}


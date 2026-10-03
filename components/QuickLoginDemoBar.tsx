'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserCheck, RotateCcw, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface QuickLoginProps {
  currentUserEmail?: string;
  onUserSwitched?: () => void;
}

export default function QuickLoginDemoBar({ currentUserEmail: propEmail, onUserSwitched }: QuickLoginProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeEmail, setActiveEmail] = useState<string | undefined>(propEmail);
  const [switching, setSwitching] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const demoAccounts = [
    { name: 'Alice', email: 'alice@wallet.secure', balance: '₹10k', role: 'Enterprise Sender' },
    { name: 'Bob', email: 'bob@wallet.secure', balance: '₹7.5k', role: 'Vendor Account' },
    { name: 'Charlie', email: 'charlie@wallet.secure', balance: '₹5k', role: 'Merchant Peer' },
    { name: 'Ashiq', email: 'ashiq@wallet.secure', balance: '₹12k', role: 'Security Auditor' },
  ];

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setActiveEmail(data.user.email);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleQuickLogin = async (email: string) => {
    try {
      setSwitching(email);
      setStatusMsg(null);
      const res = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveEmail(email);
        const switched = demoAccounts.find((a) => a.email === email);
        setStatusMsg(`Active Tenant: ${switched?.name} (${switched?.role})`);
        setTimeout(() => setStatusMsg(null), 3500);
        if (onUserSwitched) onUserSwitched();
        router.refresh();
      } else {
        setStatusMsg(data.error || 'Failed to switch tenant account');
      }
    } catch (err: any) {
      setStatusMsg(err.message || 'Tenant switch error');
    } finally {
      setSwitching(null);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset simulation ledger, Ed25519 keystores, and transaction history to the baseline production seed state?')) {
      return;
    }
    try {
      setResetting(true);
      setStatusMsg(null);
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg('System state & cryptographic ledger successfully re-seeded');
        setTimeout(() => setStatusMsg(null), 3500);
        if (onUserSwitched) onUserSwitched();
        router.refresh();
      } else {
        setStatusMsg(data.error || 'State reset failed');
      }
    } catch (err: any) {
      setStatusMsg(err.message || 'Reset error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="bg-[#0c0d0d] border-b border-[#2d2247]/80 text-slate-300 text-xs py-2 px-4 sticky top-0 z-50 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Enterprise Status Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#181126] border border-[#673de6]/40 text-[#e4dcfa] font-mono text-[11px] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="font-semibold text-emerald-400">Mainnet Simulation Active</span>
            <span className="text-[#a98cf1]/50">•</span>
            <span className="text-slate-300 font-medium">FIPS 180-4 &amp; RFC 8032 Compliant Engine</span>
          </div>
          {statusMsg && (
            <span className="hidden lg:inline-block text-[#e4dcfa] bg-[#673de6]/25 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-[#673de6]/40 animate-pulse font-mono">
              {statusMsg}
            </span>
          )}
        </div>

        {/* Center/Right: Multi-Tenant Persona Bar & Reset Demo State */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider hidden xl:inline mr-1">
            Test Tenant Switcher:
          </span>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {demoAccounts.map((acc) => {
              const isCurrent = activeEmail === acc.email;
              return (
                <button
                  key={acc.email}
                  onClick={() => handleQuickLogin(acc.email)}
                  disabled={switching !== null}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-[#673de6] text-white shadow-cosmic border border-[#a98cf1]'
                      : 'bg-[#181126]/90 hover:bg-[#2d2247] text-slate-300 hover:text-white border border-[#2d2247]'
                  }`}
                  title={`${acc.name} — ${acc.role} (${acc.email})`}
                >
                  {isCurrent ? (
                    <Check className="w-3 h-3 text-emerald-300" />
                  ) : (
                    <UserCheck className="w-3 h-3 text-slate-400" />
                  )}
                  <span className="font-semibold">{acc.name}</span>
                  <span className="text-slate-400 text-[10px] hidden sm:inline">({acc.role.split(' ')[0]})</span>
                  <span className={`font-mono text-[10px] ${isCurrent ? 'text-[#e4dcfa] font-bold' : 'text-emerald-400'}`}>
                    {acc.balance}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Reset Demo State Action */}
          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181126] hover:bg-[#2d2247] text-amber-300 hover:text-amber-200 border border-amber-500/30 text-[11px] font-medium transition-all shadow-sm"
            title="Reset simulated transactions, balances, and keys to baseline production seed"
          >
            <RotateCcw className={`w-3 h-3 ${resetting ? 'animate-spin-custom text-amber-400' : ''}`} />
            <span>{resetting ? 'Re-seeding...' : 'Reset Demo State'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, RefreshCw, KeyRound } from 'lucide-react';

interface QuickLoginProps {
  currentUserEmail?: string;
  onUserSwitched?: () => void;
}

export default function QuickLoginDemoBar({ currentUserEmail, onUserSwitched }: QuickLoginProps) {
  const router = useRouter();
  const [switching, setSwitching] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const demoAccounts = [
    { name: 'Alice', email: 'alice@wallet.secure', role: 'Sender / Primary Demo User' },
    { name: 'Bob', email: 'bob@wallet.secure', role: 'Receiver' },
    { name: 'Charlie', email: 'charlie@wallet.secure', role: 'Third-Party Peer' },
  ];

  const handleQuickLogin = async (email: string) => {
    try {
      setSwitching(email);
      setMsg(null);
      const res = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        if (onUserSwitched) onUserSwitched();
        router.refresh();
      } else {
        setMsg(data.error || 'Failed to switch user');
      }
    } catch (err: any) {
      setMsg(err.message || 'Error switching');
    } finally {
      setSwitching(null);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset all demo balances, transactions, and cryptographic keys to the initial evaluation state?')) {
      return;
    }
    try {
      setResetting(true);
      setMsg(null);
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMsg('Demo environment reset successfully!');
        if (onUserSwitched) onUserSwitched();
        router.refresh();
      } else {
        setMsg(data.error || 'Reset failed');
      }
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Viva Demo Quick-Switch:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {demoAccounts.map((acc) => {
              const isActive = currentUserEmail === acc.email;
              return (
                <button
                  key={acc.email}
                  onClick={() => handleQuickLogin(acc.email)}
                  disabled={switching !== null}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                  }`}
                  title={`Login as ${acc.name} (${acc.email})`}
                >
                  <UserCheck className={`w-3 h-3 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{acc.name}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {msg && (
            <span className="text-emerald-400 text-[11px] animate-fade-in font-medium">
              {msg}
            </span>
          )}
          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all font-medium text-[11px]"
            title="Reset demo transactions, balances, and keys to default"
          >
            <RefreshCw className={`w-3 h-3 ${resetting ? 'animate-spin text-amber-400' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reset Demo State'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

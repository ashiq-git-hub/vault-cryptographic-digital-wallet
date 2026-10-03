'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  User,
  LogOut,
  RotateCcw,
  Check,
  Menu,
  X,
  Shield,
  ArrowRight,
  Terminal,
  Activity,
  Layers,
  Cpu,
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string;
  wallet?: {
    balance: number;
    currency: string;
  };
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const demoAccounts = [
    { name: 'Alice', email: 'alice@wallet.secure', role: 'Enterprise Sender' },
    { name: 'Bob', email: 'bob@wallet.secure', role: 'Vendor Account' },
    { name: 'Charlie', email: 'charlie@wallet.secure', role: 'Merchant Peer' },
    { name: 'Ashiq', email: 'ashiq@wallet.secure', role: 'Security Auditor' },
  ];

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPersonaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setPersonaMenuOpen(false);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwitchPersona = async (email: string) => {
    try {
      setSwitching(email);
      const res = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setPersonaMenuOpen(false);
        await fetchUser();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(null);
    }
  };

  const handleResetState = async () => {
    if (!confirm('Re-seed all simulated accounts, cryptographic keystores, and transaction history?')) {
      return;
    }
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      setPersonaMenuOpen(false);
      await fetchUser();
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { name: 'Console', href: '/wallet' },
    { name: 'Workbench', href: '/crypto-lab' },
    { name: 'Attack Studio', href: '/security?tab=experiments' },
    { name: 'Ledger', href: '/transactions' },
    { name: 'API Reference', href: '/record-book' },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/wallet') return pathname === '/wallet';
    if (href === '/record-book') return pathname === '/record-book';
    if (href.startsWith('/security')) return pathname.startsWith('/security');
    if (href.startsWith('/crypto-lab')) return pathname.startsWith('/crypto-lab');
    if (href.startsWith('/transactions')) return pathname.startsWith('/transactions');
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e2e8f0] bg-white/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Mark & Identity */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-[#0c0d0d] text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm group-hover:bg-[#673de6] transition-colors">
                V
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[#0f172a] text-[15px] tracking-tight leading-none group-hover:text-[#673de6] transition-colors">
                  VAULT
                </span>
                <span className="text-[10px] text-[#64748b] tracking-wider uppercase font-semibold mt-0.5">
                  Cryptographic Infrastructure
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      active
                        ? 'bg-[#673de6]/10 text-[#673de6]'
                        : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls & System Status */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* System Status Pill Badge */}
            <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Verified</span>
            </div>

            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-all text-left shadow-subtle"
                >
                  <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span className="text-xs font-semibold text-[#0f172a]">{currentUser.name}</span>
                  <span className="text-[10px] text-[#64748b] font-mono hidden lg:inline">
                    ({currentUser.email.split('@')[0]})
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
                </button>

                {/* Account Switcher Dropdown */}
                {personaMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-[#e2e8f0] shadow-xl py-2 z-50 text-xs animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-[#f1f5f9]">
                      <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
                        Authenticated Persona
                      </div>
                      <div className="font-bold text-[#0f172a] text-sm mt-0.5">{currentUser.name}</div>
                      <div className="text-[11px] text-[#64748b] font-mono">{currentUser.email}</div>
                    </div>

                    <div className="px-4 pt-2.5 pb-1 text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
                      Switch Test Tenant
                    </div>
                    <div className="px-2 space-y-0.5">
                      {demoAccounts.map((acc) => {
                        const isCurrent = currentUser.email === acc.email;
                        return (
                          <button
                            key={acc.email}
                            onClick={() => handleSwitchPersona(acc.email)}
                            disabled={switching !== null}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                              isCurrent
                                ? 'bg-[#673de6]/10 text-[#673de6] font-semibold'
                                : 'text-[#334155] hover:bg-[#f8fafc]'
                            }`}
                          >
                            <div>
                              <div className="text-xs leading-snug">{acc.name}</div>
                              <div className="text-[10px] text-[#94a3b8] leading-none mt-0.5 font-normal">
                                {acc.role}
                              </div>
                            </div>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-[#673de6]" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="my-2 border-t border-[#f1f5f9]" />

                    <div className="px-2 space-y-0.5">
                      <Link
                        href="/profile"
                        onClick={() => setPersonaMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#334155] hover:bg-[#f8fafc] transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#64748b]" />
                        <span>Keystores &amp; API Keys</span>
                      </Link>
                      <button
                        onClick={handleResetState}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors text-left"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Re-seed System State</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#673de6] text-white hover:bg-[#542bc7] transition-all shadow-cosmic"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#e2e8f0] bg-white px-4 pt-3 pb-5 space-y-4">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                  isLinkActive(link.href)
                    ? 'bg-[#673de6]/10 text-[#673de6]'
                    : 'text-[#64748b] hover:bg-[#f8fafc]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {currentUser && (
            <div className="pt-3 border-t border-[#f1f5f9] space-y-2 text-xs">
              <div className="text-[10px] text-[#94a3b8] font-semibold px-2 uppercase tracking-wider">
                Logged in as {currentUser.name}
              </div>
              <div className="grid grid-cols-2 gap-1.5 px-1">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => {
                      handleSwitchPersona(acc.email);
                      setMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-[#e2e8f0] text-left hover:bg-[#f8fafc]"
                  >
                    <div className="font-semibold text-[#0f172a]">{acc.name}</div>
                    <div className="text-[10px] text-[#94a3b8]">{acc.role.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
              <div className="pt-2 flex items-center justify-between px-2 text-xs">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#64748b] hover:text-[#0f172a] font-medium"
                >
                  Keystores &amp; API Keys
                </Link>
                <button onClick={handleLogout} className="text-rose-600 font-semibold">
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}


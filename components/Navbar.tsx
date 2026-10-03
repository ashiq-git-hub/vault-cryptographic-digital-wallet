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
    { name: 'Alice', email: 'alice@wallet.secure', role: 'Sender / Primary Account' },
    { name: 'Bob', email: 'bob@wallet.secure', role: 'Receiver' },
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
    if (!confirm('Reset all ledger balances, keys, and transaction history to the clean initial evaluation state?')) {
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
    { name: 'Wallet', href: '/wallet' },
    { name: 'Activity', href: '/transactions' },
    { name: 'Security', href: '/security' },
    { name: 'Cryptography Lab', href: '/crypto-lab' },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/wallet') return pathname === '/wallet';
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-[#FFFFFF] border-b border-[#E7E7E4] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-[#171717] text-[#FFFFFF] flex items-center justify-center font-semibold text-sm tracking-wider">
                V
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#171717] text-[15px] tracking-tight leading-none group-hover:text-[#000000]">
                  VAULT
                </span>
                <span className="text-[11px] text-[#6B6B6B] tracking-normal font-normal mt-0.5">
                  Cryptographic Wallet
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                      active
                        ? 'bg-[#F2F2EE] text-[#171717]'
                        : 'text-[#6B6B6B] hover:text-[#171717] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] hover:bg-[#F7F7F5] transition-colors text-left"
                >
                  <div className="w-2 h-2 rounded-full bg-[#16845B]" />
                  <span className="text-[13px] font-medium text-[#171717]">{currentUser.name}</span>
                  <span className="text-[11px] text-[#6B6B6B] font-mono hidden lg:inline">
                    ({currentUser.email.split('@')[0]})
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8E8E8E]" />
                </button>

                {/* Persona Switcher Dropdown */}
                {personaMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#FFFFFF] rounded-xl border border-[#E7E7E4] shadow-popover py-1.5 z-50 text-[13px]">
                    <div className="px-3.5 py-2 border-b border-[#EFEFED]">
                      <div className="text-[11px] font-medium text-[#8E8E8E] uppercase tracking-wider">
                        Active Persona
                      </div>
                      <div className="font-semibold text-[#171717] mt-0.5">{currentUser.name}</div>
                      <div className="text-[12px] text-[#6B6B6B] font-mono">{currentUser.email}</div>
                    </div>

                    <div className="px-3.5 pt-2 pb-1 text-[11px] font-medium text-[#8E8E8E] uppercase tracking-wider">
                      Switch Test Persona
                    </div>
                    <div className="px-1.5 space-y-0.5">
                      {demoAccounts.map((acc) => {
                        const isCurrent = currentUser.email === acc.email;
                        return (
                          <button
                            key={acc.email}
                            onClick={() => handleSwitchPersona(acc.email)}
                            disabled={switching !== null}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                              isCurrent
                                ? 'bg-[#F2F2EE] text-[#171717] font-medium'
                                : 'text-[#404040] hover:bg-[#FAF9F6]'
                            }`}
                          >
                            <div>
                              <div className="text-[13px] leading-snug">{acc.name}</div>
                              <div className="text-[11px] text-[#8E8E8E] leading-none mt-0.5">
                                {acc.role}
                              </div>
                            </div>
                            {isCurrent && <Check className="w-4 h-4 text-[#16845B]" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="my-1.5 border-t border-[#EFEFED]" />

                    <div className="px-1.5 space-y-0.5">
                      <Link
                        href="/profile"
                        onClick={() => setPersonaMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#404040] hover:bg-[#FAF9F6] transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#6B6B6B]" />
                        <span>Keys &amp; Account Profile</span>
                      </Link>
                      <button
                        onClick={handleResetState}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#B7791F] hover:bg-[#FEF8EC] transition-colors text-left"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Demo Ledger State</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#C44536] hover:bg-[#FDF2F1] transition-colors text-left"
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
                  className="px-3.5 py-1.5 rounded-md text-[13px] font-medium text-[#171717] hover:bg-[#F2F2EE] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-md text-[13px] font-medium bg-[#171717] text-[#FFFFFF] hover:bg-[#000000] transition-colors"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#6B6B6B] hover:text-[#171717] hover:bg-[#F2F2EE]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E7E4] bg-[#FFFFFF] px-4 pt-3 pb-4 space-y-3">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isLinkActive(link.href)
                    ? 'bg-[#F2F2EE] text-[#171717]'
                    : 'text-[#6B6B6B] hover:bg-[#FAF9F6]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {currentUser && (
            <div className="pt-3 border-t border-[#EFEFED] space-y-2">
              <div className="text-xs text-[#8E8E8E] font-medium px-3 uppercase tracking-wider">
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
                    className="px-2.5 py-1.5 text-xs rounded border border-[#E7E7E4] text-left hover:bg-[#F7F7F5]"
                  >
                    <div className="font-medium text-[#171717]">{acc.name}</div>
                    <div className="text-[10px] text-[#8E8E8E]">{acc.role.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
              <div className="pt-2 flex items-center justify-between px-3 text-xs">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#6B6B6B] hover:text-[#171717]"
                >
                  Profile &amp; Keys
                </Link>
                <button onClick={handleLogout} className="text-[#C44536]">
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


'use client';

import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <aside
      aria-label="Security Sandbox Notice"
      className="bg-[#0c0d0d] border-b border-[#2d2247]/60 text-slate-400 text-[11px] py-1 px-4 font-mono"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-[#a98cf1] bg-[#181126] border border-[#673de6]/40 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
            Security Sandbox
          </span>
          <span className="text-slate-300">
            Isolated cryptographic ledger simulation &bull; Sovereign key custody &bull; Zero external banking connectivity
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 hidden md:flex text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-[#a98cf1]" />
          <span>FIPS 180-4 &bull; RFC 8032 &bull; NIST SP 800-38D &bull; RFC 8785</span>
        </div>
      </div>
    </aside>
  );
}


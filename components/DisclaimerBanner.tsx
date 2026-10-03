'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <aside
      aria-label="Academic Simulation Notice"
      className="bg-[#F2F2EE] border-b border-[#E7E7E4] text-[#6B6B6B] text-[12px] py-1.5 px-4"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 font-normal">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-medium text-[#171717] bg-[#FFFFFF] border border-[#E7E7E4] px-1.5 py-0.5 rounded text-[11px]">
            Academic Simulation
          </span>
          <span>
            Simulated ledger &bull; Fictional currency (INR &#8377;) &bull; Zero external banking connectivity
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#8E8E8E] font-mono hidden sm:flex">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" />
          <span>SHA-256 &bull; Ed25519 &bull; AES-256-GCM &bull; PBKDF2</span>
        </div>
      </div>
    </aside>
  );
}


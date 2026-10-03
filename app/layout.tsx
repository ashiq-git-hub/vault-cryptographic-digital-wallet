import type { Metadata } from 'next';
import './globals.css';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import Navbar from '@/components/Navbar';
import QuickLoginDemoBar from '@/components/QuickLoginDemoBar';

export const metadata: Metadata = {
  title: 'VAULT — Cryptographic Digital Wallet & Transaction Verification System',
  description:
    'Secure simulated digital wallet and cryptographic transaction verification laboratory implementing FIPS 180-4, RFC 8032, and NIST SP 800-38D.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#ffffff] text-[#0c0d0d] antialiased selection:bg-[#673de6]/20">
        <QuickLoginDemoBar />
        <DisclaimerBanner />
        <Navbar />

        <main className="flex-1 w-full">
          {children}
        </main>

        <footer className="border-t border-[#e2e8f0] bg-[#ffffff] py-8 text-xs text-[#64748b]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#0c0d0d] tracking-tight">VAULT</span>
              <span className="text-[#cbd5e1]">•</span>
              <span>Cryptographic Transaction Verification &amp; Security System</span>
            </div>
            <div className="text-[12px] font-mono text-[#64748b] flex flex-wrap items-center gap-3">
              <span className="text-[#673de6] font-semibold">FIPS 180-4</span>
              <span>•</span>
              <span className="text-[#673de6] font-semibold">RFC 8032</span>
              <span>•</span>
              <span className="text-[#673de6] font-semibold">NIST SP 800-38D</span>
              <span>•</span>
              <span className="text-[#673de6] font-semibold">RFC 8018</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

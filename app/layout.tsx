import type { Metadata } from 'next';
import './globals.css';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'VAULT — Cryptographic Digital Wallet',
  description:
    'Secure simulated digital wallet and cryptographic transaction verification laboratory.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#171717] antialiased selection:bg-[#E7E7E4]">
        <DisclaimerBanner />
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-[#E7E7E4] bg-[#FFFFFF] py-6 text-xs text-[#6B6B6B]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[#171717]">VAULT</span>
              <span className="text-[#8E8E8E]">&bull;</span>
              <span>Cryptographic Transaction Verification System</span>
            </div>
            <div className="text-[12px] font-mono text-[#8E8E8E] flex items-center gap-3">
              <span>SHA-256</span>
              <span>&bull;</span>
              <span>Ed25519</span>
              <span>&bull;</span>
              <span>AES-256-GCM</span>
              <span>&bull;</span>
              <span>PBKDF2</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}


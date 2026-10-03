'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AttackLabRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/security?tab=experiments');
  }, [router]);

  return (
    <div className="py-20 text-center space-y-3">
      <p className="text-xs text-[#6B6B6B]">Redirecting to Security Experiments...</p>
      <Link
        href="/security?tab=experiments"
        className="text-xs font-medium text-[#171717] hover:underline"
      >
        Click here if not redirected automatically &rarr;
      </Link>
    </div>
  );
}


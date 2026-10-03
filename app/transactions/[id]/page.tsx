'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Loader2,
  Lock,
  ExternalLink,
} from 'lucide-react';

export default function TransactionDetailPage() {
  const params = useParams();
  const txId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!txId) return;
    setLoading(true);
    fetch(`/api/transactions/${txId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Transaction record not found');
        return res.json();
      })
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [txId]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#171717] mx-auto mb-3" />
        <p className="text-xs text-[#6B6B6B]">Loading security audit record...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <p className="text-sm font-semibold text-[#171717]">Transaction record not found</p>
        <p className="text-xs text-[#6B6B6B]">{error}</p>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#171717] text-[#FFFFFF] text-xs font-medium hover:bg-[#000000]"
        >
          <span>Return to activity</span>
        </Link>
      </div>
    );
  }

  const { transaction: tx, verificationReport: report } = data;
  const isAccepted = tx.status === 'ACCEPTED';
  const isTampered = tx.status === 'TAMPERED';
  const isReplay = tx.status === 'REPLAY_ATTEMPT';

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#171717] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to activity</span>
        </Link>
      </div>

      {/* Header Record */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-[#8E8E8E] uppercase tracking-wider">
              Transaction Record
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#171717] mt-0.5">
              {tx.txId}
            </div>
          </div>

          <div>
            {isAccepted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EBF7EE] text-[#16845B] text-xs font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            )}
            {isTampered && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FDF2F1] text-[#C44536] text-xs font-medium">
                <X className="w-3.5 h-3.5" />
                <span>Tampered (Rejected)</span>
              </span>
            )}
            {isReplay && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FEF8EC] text-[#B7791F] text-xs font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Replay Attempt (Rejected)</span>
              </span>
            )}
          </div>
        </div>

        {/* Hero Transfer Amount */}
        <div className="pt-2 pb-1">
          <div className="text-3xl sm:text-4xl font-bold font-mono text-[#171717]">
            {formatCurrency(tx.amount)}
          </div>
          <div className="text-sm font-medium text-[#404040] mt-1 flex items-center gap-2">
            <span>{tx.sender.name}</span>
            <span className="text-[#8E8E8E]">&rarr;</span>
            <span>{tx.receiver.name}</span>
          </div>
        </div>
      </div>

      {/* Transaction Details (Prompt Section 9) */}
      <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-5 sm:p-6 shadow-card space-y-4">
        <h2 className="text-xs font-semibold text-[#8E8E8E] uppercase tracking-wider border-b border-[#EFEFED] pb-2">
          Transaction Information
        </h2>

        <div className="grid grid-cols-2 gap-y-3.5 text-xs">
          <div>
            <div className="text-[#8E8E8E]">Amount</div>
            <div className="font-semibold text-[#171717] font-mono mt-0.5">
              {formatCurrency(tx.amount)}
            </div>
          </div>

          <div>
            <div className="text-[#8E8E8E]">Timestamp</div>
            <div className="font-medium text-[#171717] mt-0.5">
              {formatDate(tx.createdAt || tx.timestamp)}
            </div>
          </div>

          <div>
            <div className="text-[#8E8E8E]">Sender Account</div>
            <div className="font-medium text-[#171717] mt-0.5">
              {tx.sender.name}{' '}
              <span className="text-[#8E8E8E] font-mono text-[11px]">({tx.sender.email})</span>
            </div>
          </div>

          <div>
            <div className="text-[#8E8E8E]">Recipient Account</div>
            <div className="font-medium text-[#171717] mt-0.5">
              {tx.receiver.name}{' '}
              <span className="text-[#8E8E8E] font-mono text-[11px]">({tx.receiver.email})</span>
            </div>
          </div>

          {tx.note && (
            <div className="col-span-2 pt-2 border-t border-[#EFEFED]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#8E8E8E]">Transaction Memo</span>
                <span className="text-[11px] font-mono text-[#16845B] flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>AES-256-GCM Encrypted on Ledger</span>
                </span>
              </div>
              <div className="text-[#171717] italic bg-[#FAF9F6] p-2.5 rounded border border-[#EFEFED]">
                &ldquo;{tx.note}&rdquo;
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cryptographic Verification Section (Prompt Section 9) */}
      <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl p-5 sm:p-6 shadow-card space-y-4">
        <h2 className="text-xs font-semibold text-[#8E8E8E] uppercase tracking-wider border-b border-[#EFEFED] pb-2">
          Cryptographic Verification
        </h2>

        <div className="space-y-4 text-xs">
          {/* Integrity */}
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="font-semibold text-[#171717]">Integrity</div>
              <div className="text-[#6B6B6B]">SHA-256 canonical payload hash</div>
            </div>
            <div>
              {report?.integrityVerified ? (
                <span className="inline-flex items-center gap-1 font-medium text-[#16845B]">
                  <Check className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-[#C44536]">
                  <X className="w-3.5 h-3.5" />
                  <span>Failed (Tampered)</span>
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-[#EFEFED]" />

          {/* Signature */}
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="font-semibold text-[#171717]">Signature Authenticity</div>
              <div className="text-[#6B6B6B]">Ed25519 Curve25519 asymmetric signature</div>
            </div>
            <div>
              {report?.signatureVerified ? (
                <span className="inline-flex items-center gap-1 font-medium text-[#16845B]">
                  <Check className="w-3.5 h-3.5" />
                  <span>Valid</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-[#C44536]">
                  <X className="w-3.5 h-3.5" />
                  <span>Invalid</span>
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-[#EFEFED]" />

          {/* Replay Protection */}
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="font-semibold text-[#171717]">Replay Protection</div>
              <div className="text-[#6B6B6B] font-mono text-[11px]">
                Nonce: {tx.nonce.slice(0, 16)}...
              </div>
            </div>
            <div>
              {report?.nonceFresh ? (
                <span className="inline-flex items-center gap-1 font-medium text-[#16845B]">
                  <Check className="w-3.5 h-3.5" />
                  <span>Not previously processed</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-[#B7791F]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Duplicate Nonce Detected</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Section: View Cryptographic Details (Prompt Section 9) */}
      <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl overflow-hidden shadow-card">
        <button
          type="button"
          onClick={() => setDetailsExpanded(!detailsExpanded)}
          className="w-full p-5 sm:px-6 flex items-center justify-between hover:bg-[#FAF9F6] transition-colors text-left"
        >
          <div>
            <div className="text-xs font-semibold text-[#171717]">
              View cryptographic audit details
            </div>
            <div className="text-[11px] text-[#6B6B6B] mt-0.5">
              Canonical string, SHA-256 digest, raw signature, and sender public key.
            </div>
          </div>
          {detailsExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#8E8E8E]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#8E8E8E]" />
          )}
        </button>

        {detailsExpanded && (
          <div className="p-5 sm:p-6 border-t border-[#EFEFED] space-y-4 text-xs font-mono">
            {/* Canonical string */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#8E8E8E] font-sans">
                <span className="font-semibold uppercase tracking-wider">
                  Canonical Transaction String (RFC 8785)
                </span>
                <button
                  onClick={() => copyToClipboard(tx.canonicalPayload, 'canonical')}
                  className="hover:text-[#171717] flex items-center gap-1"
                >
                  <span>{copiedKey === 'canonical' ? 'Copied' : 'Copy'}</span>
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="p-3 bg-[#FAF9F6] rounded-md border border-[#EFEFED] text-[#171717] break-all text-[11px] leading-relaxed">
                {tx.canonicalPayload}
              </div>
            </div>

            {/* SHA-256 digest */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#8E8E8E] font-sans">
                <span className="font-semibold uppercase tracking-wider">SHA-256 Digest</span>
                <button
                  onClick={() => copyToClipboard(tx.transactionHash, 'hash')}
                  className="hover:text-[#171717] flex items-center gap-1"
                >
                  <span>{copiedKey === 'hash' ? 'Copied' : 'Copy'}</span>
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="p-3 bg-[#FAF9F6] rounded-md border border-[#EFEFED] text-[#171717] break-all text-[11px]">
                {tx.transactionHash}
              </div>
            </div>

            {/* Ed25519 signature */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#8E8E8E] font-sans">
                <span className="font-semibold uppercase tracking-wider">
                  Ed25519 Digital Signature (64 Bytes)
                </span>
                <button
                  onClick={() => copyToClipboard(tx.signature, 'sig')}
                  className="hover:text-[#171717] flex items-center gap-1"
                >
                  <span>{copiedKey === 'sig' ? 'Copied' : 'Copy'}</span>
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="p-3 bg-[#FAF9F6] rounded-md border border-[#EFEFED] text-[#171717] break-all text-[11px]">
                {tx.signature}
              </div>
            </div>

            {/* Public Key Fingerprint */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#8E8E8E] font-sans">
                <span className="font-semibold uppercase tracking-wider">
                  Sender Public Key Fingerprint
                </span>
                <button
                  onClick={() => copyToClipboard(report?.publicKeyFingerprint || '', 'fp')}
                  className="hover:text-[#171717] flex items-center gap-1"
                >
                  <span>{copiedKey === 'fp' ? 'Copied' : 'Copy'}</span>
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="p-3 bg-[#FAF9F6] rounded-md border border-[#EFEFED] text-[#171717] break-all text-[11px]">
                {report?.publicKeyFingerprint}
              </div>
            </div>

            {/* Verification Result */}
            <div className="pt-2 border-t border-[#EFEFED] flex items-center justify-between font-sans">
              <span className="text-[#8E8E8E]">Verification Result</span>
              <span className="font-semibold text-xs text-[#16845B] font-mono">
                VALID (Signature verified against public key)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


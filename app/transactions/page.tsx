'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Check,
  X,
  AlertTriangle,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'my'>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACCEPTED' | 'TAMPERED' | 'REPLAY_ATTEMPT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const [txRes, userRes] = await Promise.all([
        fetch(`/api/transactions?filter=${filterType}`),
        fetch('/api/auth/me'),
      ]);
      const txData = await txRes.json();
      const userData = await userRes.json();

      if (txData.transactions) {
        setTransactions(txData.transactions);
      }
      if (userData.authenticated) {
        setCurrentUser(userData.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterType]);

  const filteredList = transactions.filter((tx) => {
    if (statusFilter !== 'ALL' && tx.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchId = tx.txId.toLowerCase().includes(q);
      const matchSender = tx.sender.name.toLowerCase().includes(q);
      const matchReceiver = tx.receiver.name.toLowerCase().includes(q);
      return matchId || matchSender || matchReceiver;
    }
    return true;
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Activity</h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Immutable transaction record with cryptographic signatures and integrity hashes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border border-[#E7E7E4] bg-[#FFFFFF] p-0.5 text-xs font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded transition-colors ${
                filterType === 'all'
                  ? 'bg-[#171717] text-[#FFFFFF]'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              All ledger
            </button>
            <button
              onClick={() => setFilterType('my')}
              className={`px-3 py-1 rounded transition-colors ${
                filterType === 'my'
                  ? 'bg-[#171717] text-[#FFFFFF]'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              My transactions
            </button>
          </div>

          <button
            onClick={fetchTransactions}
            className="p-1.5 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] hover:bg-[#FAF9F6] text-[#6B6B6B] hover:text-[#171717] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#8E8E8E] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID or person..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-[#E7E7E4] bg-[#FFFFFF] text-xs text-[#171717] placeholder-[#8E8E8E] focus:outline-none focus:border-[#171717] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'ACCEPTED', 'TAMPERED', 'REPLAY_ATTEMPT'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                statusFilter === st
                  ? 'bg-[#E7E7E4] text-[#171717]'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              {st === 'ALL'
                ? 'All Statuses'
                : st === 'ACCEPTED'
                ? 'Verified'
                : st === 'TAMPERED'
                ? 'Tampered'
                : 'Replay Attempt'}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Table (Prompt Section 20) */}
      <div className="bg-[#FFFFFF] border border-[#E7E7E4] rounded-xl overflow-hidden shadow-card">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-[#171717] mx-auto mb-2" />
            <p className="text-xs text-[#6B6B6B]">Loading activity ledger...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-semibold text-[#171717]">No activity found</p>
            <p className="text-xs text-[#6B6B6B]">No transactions matched your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EFEFED] bg-[#FAFAF9] text-[11px] font-medium text-[#8E8E8E] uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Transaction</th>
                  <th className="py-3 px-4">From &rarr; To</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFED]">
                {filteredList.map((tx) => {
                  const isAccepted = tx.status === 'ACCEPTED';
                  const isTampered = tx.status === 'TAMPERED';
                  const isReplay = tx.status === 'REPLAY_ATTEMPT';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-[#FAF9F6] transition-colors group cursor-pointer"
                      onClick={() => (window.location.href = `/transactions/${tx.id}`)}
                    >
                      {/* Transaction ID */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-[#171717]">
                        {tx.txId}
                      </td>

                      {/* From -> To */}
                      <td className="py-3.5 px-4 font-medium text-[#171717]">
                        <span>{tx.sender.name}</span>
                        <span className="text-[#8E8E8E] mx-1.5">&rarr;</span>
                        <span>{tx.receiver.name}</span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#171717]">
                        {formatCurrency(tx.amount)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isAccepted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#16845B]">
                            <Check className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        )}
                        {isTampered && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C44536]">
                            <X className="w-3 h-3" />
                            <span>Tampered</span>
                          </span>
                        )}
                        {isReplay && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B7791F]">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Replay Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#6B6B6B] whitespace-nowrap">
                        {formatDate(tx.createdAt || tx.timestamp)}
                      </td>

                      {/* Audit Link */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/transactions/${tx.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6B6B6B] hover:text-[#171717]"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


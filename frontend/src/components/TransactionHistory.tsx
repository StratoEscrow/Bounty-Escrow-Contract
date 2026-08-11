"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/useWallet";

interface Transaction {
  hash: string;
  type: "create_bounty" | "submit_work" | "approve_submission" | "reclaim_expired";
  timestamp: number;
  status: "success" | "pending" | "failed";
  details: string;
}

interface TransactionHistoryProps {
  onClose: () => void;
}

export function TransactionHistory({ onClose }: TransactionHistoryProps) {
  const { address } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from local storage or an API
    // For now, we'll use a mock implementation
    const mockTransactions: Transaction[] = [
      {
        hash: "abc123...",
        type: "create_bounty",
        timestamp: Date.now() - 3600000,
        status: "success",
        details: "Created bounty #1"
      },
      {
        hash: "def456...",
        type: "submit_work",
        timestamp: Date.now() - 7200000,
        status: "success",
        details: "Submitted work for bounty #1"
      }
    ];
    
    setTransactions(mockTransactions);
    setIsLoading(false);
  }, [address]);

  const getTransactionTypeLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "create_bounty": return "Created Bounty";
      case "submit_work": return "Submitted Work";
      case "approve_submission": return "Approved Submission";
      case "reclaim_expired": return "Reclaimed Funds";
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "success": return "text-green-400";
      case "pending": return "text-yellow-400";
      case "failed": return "text-red-400";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No transactions found
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.hash} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{getTransactionTypeLabel(tx.type)}</p>
                    <p className="text-sm text-gray-400">{tx.details}</p>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>{tx.hash}</span>
                  <span>{new Date(tx.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

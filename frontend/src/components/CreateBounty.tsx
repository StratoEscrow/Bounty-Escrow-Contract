"use client";

import { useState } from "react";
import { createBounty } from "@/lib/contract";
import { useWallet } from "@/lib/useWallet";

interface CreateBountyProps {
  onBountyCreated: () => void;
}

export function CreateBounty({ onBountyCreated }: CreateBountyProps) {
  const { address } = useWallet();
  const [title, setTitle] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!title || !tokenAddress || !rewardAmount || !deadline) {
      setError("All fields are required");
      return;
    }

    // Validate token address format
    if (!tokenAddress.startsWith('G') || tokenAddress.length !== 56) {
      setError("Invalid Stellar address format");
      return;
    }

    // Validate reward amount
    const amount = parseFloat(rewardAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Reward amount must be a positive number");
      return;
    }

    // Validate deadline
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      setError("Deadline must be in the future");
      return;
    }

    try {
      setIsSubmitting(true);

      const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);
      const txHash = await createBounty(address, {
        title,
        token_address: tokenAddress,
        reward_amount: rewardAmount,
        deadline: deadlineTimestamp,
      });

      console.log("Transaction submitted:", txHash);
      setSuccess(true);
      setError(null);

      // Reset form after success
      setTimeout(() => {
        setTitle("");
        setTokenAddress("");
        setRewardAmount("");
        setDeadline("");
        setSuccess(false);
        onBountyCreated();
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create bounty";
      setError(errorMessage);
      setSuccess(false);
      console.error("Bounty creation error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Bounty Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Build a DeFi dashboard"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Token Address (SEP-41)</label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="e.g., GB..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Reward Amount</label>
          <input
            type="text"
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
            placeholder="e.g., 1000"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Deadline</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg animate-pulse">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-2 rounded-lg animate-pulse">
            Bounty created successfully! 🎉
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || success}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Bounty...
            </span>
          ) : success ? (
            "✓ Created!"
          ) : (
            "Create Bounty"
          )}
        </button>
      </form>
    </div>
  );
}

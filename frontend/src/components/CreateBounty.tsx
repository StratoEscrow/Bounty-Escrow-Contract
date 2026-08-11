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
      alert(`Bounty created successfully! Transaction hash: ${txHash}`);

      // Reset form
      setTitle("");
      setTokenAddress("");
      setRewardAmount("");
      setDeadline("");
      onBountyCreated();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create bounty";
      setError(errorMessage);
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
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
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
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
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
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Deadline</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
        >
          {isSubmitting ? "Creating Bounty..." : "Create Bounty"}
        </button>
      </form>
    </div>
  );
}

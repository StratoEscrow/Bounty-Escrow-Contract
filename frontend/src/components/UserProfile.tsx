"use client";

import { useState } from "react";
import { useWallet } from "@/lib/useWallet";

interface UserProfileProps {
  onToggleHistory: () => void;
}

export function UserProfile({ onToggleHistory }: UserProfileProps) {
  const { address, isConnected } = useWallet();
  const [showProfile, setShowProfile] = useState(false);

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfile(!showProfile)}
        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-2 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
          {address.slice(0, 2).toUpperCase()}
        </div>
        <span className="text-sm font-medium">{address.slice(0, 6)}...{address.slice(-4)}</span>
      </button>

      {showProfile && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-10">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-white">User Profile</h3>
            <p className="text-sm text-gray-400 mt-1">{address}</p>
          </div>
          <div className="p-4 space-y-2">
            <button
              onClick={onToggleHistory}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Transaction History
            </button>
            <button
              onClick={() => window.open(`https://stellar.expert/explorer/${address}`, '_blank')}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              View on Stellar Explorer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

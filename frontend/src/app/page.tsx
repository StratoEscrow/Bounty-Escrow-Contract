"use client";

import { useState } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { CreateBounty } from "@/components/CreateBounty";
import { BountyList } from "@/components/BountyList";
import { UserProfile } from "@/components/UserProfile";
import { TransactionHistory } from "@/components/TransactionHistory";
import { useWallet } from "@/lib/useWallet";

export default function Home() {
  const { isConnected, address } = useWallet();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);

  const handleBountyCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleToggleHistory = () => {
    setShowTransactionHistory(!showTransactionHistory);
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                StratoEscrow
              </h1>
              <p className="text-gray-400">Decentralized Bounty Platform on Stellar/Soroban</p>
            </div>
            <div className="flex items-center space-x-4">
              {isConnected && <UserProfile onToggleHistory={handleToggleHistory} />}
              <WalletConnect />
            </div>
          </div>
        </header>

        {isConnected && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Create New Bounty</h2>
              <CreateBounty onBountyCreated={handleBountyCreated} />
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Active Bounties</h2>
              <BountyList key={refreshKey} userAddress={address} />
            </section>
          </div>
        )}

        {!isConnected && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400">Connect your wallet to get started</p>
          </div>
        )}
      </div>

      {showTransactionHistory && (
        <TransactionHistory onClose={handleToggleHistory} />
      )}
    </main>
  );
}

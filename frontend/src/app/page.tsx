"use client";

import { useState, useEffect } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { CreateBounty } from "@/components/CreateBounty";
import { BountyList } from "@/components/BountyList";
import { useWallet } from "@/lib/useWallet";

export default function Home() {
  const { isConnected, address } = useWallet();
  const [refresh, setRefresh] = useState(0);

  const handleBountyCreated = () => {
    setRefresh(prev => prev + 1);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">StratoEscrow</h1>
          <p className="text-gray-400">Decentralized Bounty Platform on Stellar/Soroban</p>
          <div className="mt-4">
            <WalletConnect />
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
              <BountyList key={refresh} userAddress={address} />
            </section>
          </div>
        )}

        {!isConnected && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400">Connect your wallet to get started</p>
          </div>
        )}
      </div>
    </main>
  );
}

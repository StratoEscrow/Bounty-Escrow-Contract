"use client";

import { useState } from "react";
import { useWallet, connectWallet, disconnectWallet } from "@/lib/useWallet";

export function WalletConnect() {
  const { isConnected, address, isLoading } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connectWallet();
      window.location.reload();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please make sure Freighter is installed.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      window.location.reload();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-400">Loading wallet status...</p>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Connected as</p>
          <p className="font-mono text-sm">{address.slice(0, 8)}...{address.slice(-4)}</p>
        </div>
        <button
          onClick={handleDisconnect}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
    >
      {isConnecting ? "Connecting..." : "Connect Freighter Wallet"}
    </button>
  );
}

"use client";

import { useState } from "react";
import { useWallet, connectWallet, disconnectWallet } from "@/lib/useWallet";

export function WalletConnect() {
  const { isConnected, address, isLoading, error } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connectWallet();
      window.location.reload();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      alert(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : "Failed to disconnect wallet";
      alert(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400">Loading wallet status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
        <p className="text-red-200 text-sm">{error}</p>
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
        >
          {isConnecting ? "Connecting..." : "Connect Freighter Wallet"}
        </button>
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

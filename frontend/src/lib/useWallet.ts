import { useState, useEffect } from "react";
import * as freighter from "@stellar/freighter-api";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useWallet(): WalletState {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if Freighter is installed
      const isInstalled = await freighter.isAllowed();
      if (!isInstalled) {
        setError("Freighter wallet is not installed. Please install it to continue.");
        setIsLoading(false);
        return;
      }

      const isConnected = await freighter.isConnected();
      setIsConnected(isConnected);

      if (isConnected) {
        const address = await freighter.getAddress();
        setAddress(address);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check wallet connection";
      setError(errorMessage);
      console.error("Wallet connection error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isConnected,
    address,
    isLoading,
    error,
  };
}

export async function connectWallet(): Promise<string> {
  try {
    const address = await freighter.connect();
    if (!address) {
      throw new Error("Failed to get wallet address");
    }
    return address;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet";
    console.error("Wallet connection error:", err);
    throw new Error(errorMessage);
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    await freighter.disconnect();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to disconnect wallet";
    console.error("Wallet disconnection error:", err);
    throw new Error(errorMessage);
  }
}

export async function signTransaction(xdr: string): Promise<string> {
  try {
    const signedXDR = await freighter.signTransaction(xdr);
    if (!signedXDR) {
      throw new Error("Failed to sign transaction - no signed XDR returned");
    }
    return signedXDR;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to sign transaction";
    console.error("Transaction signing error:", err);
    throw new Error(errorMessage);
  }
}

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
      const isConnected = await freighter.isConnected();
      setIsConnected(isConnected);

      if (isConnected) {
        const address = await freighter.getAddress();
        setAddress(address);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check wallet connection");
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
    return address;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Failed to connect wallet");
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    await freighter.disconnect();
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Failed to disconnect wallet");
  }
}

export async function signTransaction(xdr: string): Promise<string> {
  try {
    const signedXDR = await freighter.signTransaction(xdr);
    return signedXDR;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Failed to sign transaction");
  }
}

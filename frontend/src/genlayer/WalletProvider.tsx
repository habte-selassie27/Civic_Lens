/**
 * Wallet context — shared account state for the persistent chrome.
 *
 * Read-only actions keep working with no account connected; only writes need one
 * (section 7.3: "No account: explain what's needed; reads still work").
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  connectWallet,
  getAccounts,
  getCurrentChainId,
  getEthereumProvider,
  isMetaMaskInstalled,
  isOnCorrectNetwork,
  switchToGenLayerNetwork,
} from "@/genlayer/client";
import { setActiveAccount } from "@/services/live";

export interface WalletState {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
  isOnCorrectNetwork: boolean;
  hasProvider: boolean;
  isLoading: boolean;
}

interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  error: string | null;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const DISCONNECT_FLAG = "civiclens.wallet.disconnected";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isOnCorrectNetwork: true,
    hasProvider: false,
    isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);

  // The SDK binds the signing account when a client is built, so the service
  // layer has to be told which account is connected — and told again when the
  // reader switches accounts or disconnects. Without this, every write fails
  // inside the SDK before the wallet is ever asked ("No account set").
  useEffect(() => {
    setActiveAccount(state.address);
  }, [state.address]);

  const refresh = useCallback(async () => {
    const [accounts, chainId] = await Promise.all([getAccounts(), getCurrentChainId()]);
    setState({
      address: accounts[0] ?? null,
      chainId,
      isConnected: accounts.length > 0,
      isOnCorrectNetwork: isOnCorrectNetwork(chainId),
      hasProvider: isMetaMaskInstalled(),
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const hasProvider = isMetaMaskInstalled();
      if (!hasProvider) {
        if (!cancelled) {
          setState({
            address: null,
            chainId: null,
            isConnected: false,
            isOnCorrectNetwork: true,
            hasProvider: false,
            isLoading: false,
          });
        }
        return;
      }
      // Respect an explicit disconnect across reloads.
      const wasDisconnected =
        typeof localStorage !== "undefined" && localStorage.getItem(DISCONNECT_FLAG) === "true";
      if (wasDisconnected) {
        if (!cancelled) {
          setState({
            address: null,
            chainId: null,
            isConnected: false,
            isOnCorrectNetwork: true,
            hasProvider: true,
            isLoading: false,
          });
        }
        return;
      }
      await refresh();
      if (!cancelled) setState((prev) => ({ ...prev, isLoading: false }));
    })();

    const provider = getEthereumProvider();
    if (!provider) return;

    const onAccountsChanged = (accounts: never) => {
      const list = accounts as unknown as string[];
      if (list.length > 0 && typeof localStorage !== "undefined") {
        localStorage.removeItem(DISCONNECT_FLAG);
      }
      void refresh();
    };
    const onChainChanged = () => void refresh();
    const onDisconnect = () => {
      setState((prev) => ({ ...prev, address: null, isConnected: false }));
    };

    provider.on("accountsChanged", onAccountsChanged);
    provider.on("chainChanged", onChainChanged);
    provider.on("disconnect", onDisconnect);

    return () => {
      provider.removeListener("accountsChanged", onAccountsChanged);
      provider.removeListener("chainChanged", onChainChanged);
      provider.removeListener("disconnect", onDisconnect);
      cancelled = true;
    };
  }, [refresh]);

  const value = useMemo<WalletContextValue>(
    () => ({
      ...state,
      error,
      connect: async () => {
        setError(null);
        try {
          await connectWallet();
          if (typeof localStorage !== "undefined") localStorage.removeItem(DISCONNECT_FLAG);
          await refresh();
        } catch (err) {
          const message = err instanceof Error ? err.message : "The wallet connection didn't complete.";
          setError(
            /reject|cancel/i.test(message)
              ? "Connection cancelled in the wallet."
              : "No wallet connection was made. Reads still work without an account.",
          );
        }
      },
      disconnect: () => {
        if (typeof localStorage !== "undefined") localStorage.setItem(DISCONNECT_FLAG, "true");
        setState((prev) => ({ ...prev, address: null, isConnected: false }));
      },
      switchNetwork: async () => {
        setError(null);
        try {
          await switchToGenLayerNetwork();
          await refresh();
        } catch {
          setError("The wallet could not switch networks.");
        }
      },
    }),
    [state, error, refresh],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider.");
  return ctx;
}
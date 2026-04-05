/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import type { PoolTokenInfo } from "@/lib/types";
import { connectMultiDexWallet } from "@/lib/web3/wallet";
import { loadPoolSnapshot } from "@/lib/web3/loaders";
import { estimateMultiPoolSwap } from "@/lib/web3/quote";
import {
  addLiquidityAction,
  removeLiquidityAction,
  swapAction,
  claimFaucetTokensAction,
  DexActionError,
} from "@/lib/web3/actions";

declare global {
  interface Window {
    ethereum?: any;
  }
}

type StatusKey =
  | "walletNotConnected"
  | "connectingWallet"
  | "walletConnected"
  | "connectFailed"
  | "refreshFailed"
  | "addLiquiditySuccess"
  | "addLiquidityFailed"
  | "removeLiquiditySuccess"
  | "removeLiquidityFailed"
  | "swapSuccess"
  | "swapFailed"
  | "sameTokenError"
  | "claimFaucetSuccess"
  | "claimFaucetFailed";

type StatusParams = {
  account?: string;
  message?: string;
};

export function useMultiTokenDex() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [account, setAccount] = useState("");

  const [pool, setPool] = useState<Contract | null>(null);
  const [router, setRouter] = useState<Contract | null>(null);

  const [tokens, setTokens] = useState<PoolTokenInfo[]>([]);
  const [lpBalance, setLpBalance] = useState("0");
  const [lpRawBalance, setLpRawBalance] = useState<bigint>(BigInt(0));
  const [nativeBalance, setNativeBalance] = useState("0");

  const [loading, setLoading] = useState(false);

  const [statusKey, setStatusKey] = useState<StatusKey>("walletNotConnected");
  const [statusParams, setStatusParams] = useState<StatusParams>({});

  const [addAmounts, setAddAmounts] = useState<Record<string, string>>({});
  const [removeLpAmount, setRemoveLpAmount] = useState("");

  const [swapTokenIn, setSwapTokenIn] = useState("");
  const [swapTokenOut, setSwapTokenOut] = useState("");
  const [swapAmountIn, setSwapAmountIn] = useState("");
  const [swapEstimatedOut, setSwapEstimatedOut] = useState("0");

  const [insufficientBalanceOpen, setInsufficientBalanceOpen] = useState(false);
  const [insufficientTokenSymbol, setInsufficientTokenSymbol] = useState("");

  const [faucetTokenAddress, setFaucetTokenAddress] = useState("");
  const [faucetAmount, setFaucetAmount] = useState("");

  const tokenInInfo = useMemo(
    () => tokens.find((t) => t.address === swapTokenIn),
    [tokens, swapTokenIn],
  );

  const tokenOutInfo = useMemo(
    () => tokens.find((t) => t.address === swapTokenOut),
    [tokens, swapTokenOut],
  );

  async function connectWallet() {
    try {
      setLoading(true);
      setStatusKey("connectingWallet");
      setStatusParams({});

      const built = await connectMultiDexWallet();

      setProvider(built.provider);
      setSigner(built.signer);
      setPool(built.pool);
      setRouter(built.router);
      setAccount(built.account);

      setStatusKey("walletConnected");
      setStatusParams({ account: built.account });
    } catch (error: any) {
      console.error(error);
      setStatusKey("connectFailed");
      setStatusParams({
        message: error?.message || "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function refreshAll() {
    if (!provider || !account || !pool) return;

    try {
      const snapshot = await loadPoolSnapshot({
        provider,
        signer,
        pool,
        account,
      });

      setTokens(snapshot.tokens);
      setLpRawBalance(snapshot.lpRawBalance);
      setLpBalance(snapshot.lpBalance);
      setNativeBalance(snapshot.nativeBalance);

      if (snapshot.tokens.length >= 2) {
        if (!swapTokenIn) setSwapTokenIn(snapshot.tokens[0].address);
        if (!swapTokenOut) setSwapTokenOut(snapshot.tokens[1].address);
      }

      if (snapshot.tokens.length >= 1) {
        if (!faucetTokenAddress)
          setFaucetTokenAddress(snapshot.tokens[0].address);
      }
    } catch (error: any) {
      console.error(error);
      setStatusKey("refreshFailed");
      setStatusParams({
        message: error?.message || "Unknown error",
      });
    }
  }

  async function addLiquidity() {
    if (!router || !account || !signer || tokens.length === 0) return;

    try {
      setLoading(true);

      await addLiquidityAction({
        router,
        account,
        signer,
        tokens,
        addAmounts,
      });

      setStatusKey("addLiquiditySuccess");
      setStatusParams({});
      setAddAmounts({});
      await refreshAll();
    } catch (error: any) {
      console.error(error);

      if (
        error instanceof DexActionError &&
        error.code === "INSUFFICIENT_BALANCE"
      ) {
        setInsufficientTokenSymbol(error.tokenSymbol || "");
        setInsufficientBalanceOpen(true);
      }

      setStatusKey("addLiquidityFailed");
      setStatusParams({
        message: error?.message || "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function removeLiquidity() {
    if (!router || !pool || !account || !signer) return;

    try {
      setLoading(true);

      await removeLiquidityAction({
        router,
        pool,
        account,
        signer,
        removeLpAmount,
        lpRawBalance,
      });

      setStatusKey("removeLiquiditySuccess");
      setStatusParams({});
      setRemoveLpAmount("");
      await refreshAll();
    } catch (error: any) {
      console.error(error);

      if (
        error instanceof DexActionError &&
        error.code === "INSUFFICIENT_BALANCE"
      ) {
        setInsufficientTokenSymbol(error.tokenSymbol || "");
        setInsufficientBalanceOpen(true);
      }

      setStatusKey("removeLiquidityFailed");
      setStatusParams({
        message: error?.message || "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function swap() {
    if (!router || !account || !signer || !tokenInInfo || !tokenOutInfo) return;

    try {
      setLoading(true);

      if (swapTokenIn === swapTokenOut) {
        setStatusKey("sameTokenError");
        setStatusParams({});
        return;
      }

      await swapAction({
        router,
        account,
        signer,
        tokenInInfo,
        tokenOutInfo,
        swapAmountIn,
      });

      setStatusKey("swapSuccess");
      setStatusParams({});
      setSwapAmountIn("");
      setSwapEstimatedOut("0");
      await refreshAll();
    } catch (error: any) {
      console.error(error);

      if (
        error instanceof DexActionError &&
        error.code === "INSUFFICIENT_BALANCE"
      ) {
        setInsufficientTokenSymbol(error.tokenSymbol || "");
        setInsufficientBalanceOpen(true);
      }

      setStatusKey("swapFailed");
      setStatusParams({
        message: error?.message || "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function claimFaucetTokens() {
    if (!signer || !account || tokens.length === 0) return;

    try {
      setLoading(true);

      const selectedToken = tokens.find(
        (token) => token.address === faucetTokenAddress,
      );

      if (!selectedToken) {
        throw new DexActionError(
          "INVALID_TOKEN",
          "Invalid selected faucet token",
        );
      }

      await claimFaucetTokensAction({
        signer,
        tokenAddress: selectedToken.address,
        amount: faucetAmount,
        decimals: selectedToken.decimals,
      });

      setInsufficientBalanceOpen(false);
      setFaucetAmount("");
      setStatusKey("claimFaucetSuccess");
      setStatusParams({});
      await refreshAll();
    } catch (error: any) {
      console.error(error);
      setStatusKey("claimFaucetFailed");
      setStatusParams({
        message: error?.message || "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, [provider, account, pool, signer]);

  useEffect(() => {
    const estimated = estimateMultiPoolSwap({
      tokenInInfo,
      tokenOutInfo,
      swapAmountIn,
      swapTokenIn,
      swapTokenOut,
    });
    setSwapEstimatedOut(estimated);
  }, [swapAmountIn, swapTokenIn, swapTokenOut, tokenInInfo, tokenOutInfo]);

  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = () => window.location.reload();
    const onChainChanged = () => window.location.reload();

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum?.removeListener("chainChanged", onChainChanged);
    };
  }, []);

  return {
    account,
    loading,
    nativeBalance,

    statusKey,
    statusParams,

    tokens,
    lpBalance,

    addAmounts,
    setAddAmounts,

    removeLpAmount,
    setRemoveLpAmount,

    swapTokenIn,
    setSwapTokenIn,
    swapTokenOut,
    setSwapTokenOut,
    swapAmountIn,
    setSwapAmountIn,
    swapEstimatedOut,

    insufficientBalanceOpen,
    insufficientTokenSymbol,
    setInsufficientBalanceOpen,

    faucetTokenAddress,
    setFaucetTokenAddress,
    faucetAmount,
    setFaucetAmount,

    connectWallet,
    addLiquidity,
    removeLiquidity,
    swap,
    claimFaucetTokens,
  };
}

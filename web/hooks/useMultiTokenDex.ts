/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 多币池 DEX 主业务 Hook
 *
 * 作用：
 * 1. 管理钱包、池子、token、LP、swap 等前端状态
 * 2. 串联钱包连接、链上读取、交易动作、报价估算等模块
 * 3. 对页面组件暴露统一的可调用接口
 *
 * 这是前端业务层总入口，底层能力由 lib/web3 下的工具模块提供。
 */

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
  | "sameTokenError";

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
      setStatusKey("addLiquidityFailed");
      setStatusParams({
        message: error?.shortMessage || error?.message || "Unknown error",
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
      setStatusKey("removeLiquidityFailed");
      setStatusParams({
        message: error?.shortMessage || error?.message || "Unknown error",
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
      setStatusKey("swapFailed");
      setStatusParams({
        message: error?.shortMessage || error?.message || "Unknown error",
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

    connectWallet,
    addLiquidity,
    removeLiquidity,
    swap,
  };
}

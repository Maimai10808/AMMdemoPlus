/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { buildMultiDexContracts, buildTokenContract } from "@/lib/contracts";
import { formatUnitsSafe, makeDeadline, parseUnitsSafe } from "@/lib/format";
import { POOL_ADDRESS, ROUTER_ADDRESS, TARGET_CHAIN_ID } from "@/lib/config";
import type { PoolTokenInfo } from "@/lib/types";

declare global {
  interface Window {
    ethereum?: any;
  }
}

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
  const [status, setStatus] = useState("未连接钱包");

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

  async function ensureNetwork() {
    if (!window.ethereum) throw new Error("请先安装 MetaMask");

    const hardhatHex = "0x7a69";

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hardhatHex }],
      });
    } catch (err: any) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hardhatHex,
              chainName: "Hardhat Local",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } else {
        throw err;
      }
    }
  }

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("请先安装 MetaMask");
        return;
      }

      setLoading(true);
      setStatus("正在切换网络并连接钱包...");

      await ensureNetwork();

      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const currentAccount = accounts[0];
      if (!currentAccount) throw new Error("没有可用账户");

      const built = await buildMultiDexContracts(
        window.ethereum,
        currentAccount,
      );

      setProvider(built.provider);
      setSigner(built.signer);
      setPool(built.pool);
      setRouter(built.router);
      setAccount(currentAccount);

      const network = await built.provider.getNetwork();
      if (Number(network.chainId) !== TARGET_CHAIN_ID) {
        throw new Error(
          `当前 chainId=${network.chainId.toString()}，不是本地链`,
        );
      }

      setStatus(`钱包已连接: ${currentAccount}`);
    } catch (error: any) {
      console.error(error);
      setStatus(error?.message || "连接失败");
    } finally {
      setLoading(false);
    }
  }

  async function refreshAll() {
    if (!provider || !account || !pool) return;

    try {
      const tokenAddresses: string[] = await pool.getTokens();

      const tokenInfos: PoolTokenInfo[] = await Promise.all(
        tokenAddresses.map(async (tokenAddress) => {
          const token = buildTokenContract(tokenAddress, signer ?? provider);

          const [symbol, decimals, userBalance, poolBalanceRaw, weight] =
            await Promise.all([
              token.symbol(),
              token.decimals(),
              token.balanceOf(account),
              pool.getBalance(tokenAddress),
              pool.getWeight(tokenAddress),
            ]);

          return {
            address: tokenAddress,
            symbol,
            decimals: Number(decimals),
            balance: formatUnitsSafe(userBalance, Number(decimals), 6),
            rawBalance: userBalance,
            poolBalance: formatUnitsSafe(poolBalanceRaw, Number(decimals), 6),
            rawPoolBalance: poolBalanceRaw,
            weight: `${Number(weight) / 100}%`,
          };
        }),
      );

      const [lp, native] = await Promise.all([
        pool.balanceOf(account),
        provider.getBalance(account),
      ]);

      setTokens(tokenInfos);
      setLpRawBalance(lp);
      setLpBalance(formatUnitsSafe(lp, 18, 6));
      setNativeBalance(formatUnitsSafe(native, 18, 6));

      if (tokenInfos.length >= 2) {
        if (!swapTokenIn) setSwapTokenIn(tokenInfos[0].address);
        if (!swapTokenOut) setSwapTokenOut(tokenInfos[1].address);
      }
    } catch (error: any) {
      console.error(error);
      setStatus(error?.message || "刷新数据失败");
    }
  }

  async function approveIfNeeded(
    tokenAddress: string,
    amount: bigint,
    spender = ROUTER_ADDRESS,
  ) {
    if (!signer || !account) return;

    const token = buildTokenContract(tokenAddress, signer);
    const allowance: bigint = await token.allowance(account, spender);

    if (allowance >= amount) return;

    const tx = await token.approve(spender, amount);
    await tx.wait();
  }

  async function addLiquidity() {
    if (!router || !account || tokens.length === 0) return;

    try {
      setLoading(true);

      const amountsIn: bigint[] = [];

      for (const token of tokens) {
        const input = addAmounts[token.address] || "";
        const amount = parseUnitsSafe(input, token.decimals);

        if (amount > token.rawBalance) {
          throw new Error(`${token.symbol} 余额不足`);
        }

        if (amount > BigInt(0)) {
          await approveIfNeeded(token.address, amount);
        }

        amountsIn.push(amount);
      }

      const tx = await router.addLiquidity(
        POOL_ADDRESS,
        amountsIn,
        account,
        BigInt(makeDeadline(20)),
      );

      await tx.wait();

      setStatus("添加流动性成功");
      setAddAmounts({});
      await refreshAll();
    } catch (error: any) {
      console.error(error);
      setStatus(error?.shortMessage || error?.message || "添加流动性失败");
    } finally {
      setLoading(false);
    }
  }

  async function removeLiquidity() {
    if (!router || !pool || !account) return;

    try {
      setLoading(true);

      const liquidityIn = parseUnitsSafe(removeLpAmount, 18);
      if (liquidityIn <= BigInt(0)) {
        throw new Error("请输入正确的 LP 数量");
      }

      if (liquidityIn > lpRawBalance) {
        throw new Error("LP 余额不足");
      }

      await approveIfNeeded(POOL_ADDRESS, liquidityIn);

      const tx = await router.removeLiquidity(
        POOL_ADDRESS,
        liquidityIn,
        account,
        BigInt(makeDeadline(20)),
      );

      await tx.wait();

      setStatus("移除流动性成功");
      setRemoveLpAmount("");
      await refreshAll();
    } catch (error: any) {
      console.error(error);
      setStatus(error?.shortMessage || error?.message || "移除流动性失败");
    } finally {
      setLoading(false);
    }
  }

  async function estimateSwap() {
    if (!pool || !tokenInInfo || !tokenOutInfo || !swapAmountIn) {
      setSwapEstimatedOut("0");
      return;
    }

    try {
      if (swapTokenIn === swapTokenOut) {
        setSwapEstimatedOut("0");
        return;
      }

      const amountIn = parseUnitsSafe(swapAmountIn, tokenInInfo.decimals);
      if (amountIn <= BigInt(0)) {
        setSwapEstimatedOut("0");
        return;
      }

      const balanceIn = tokenInInfo.rawPoolBalance;
      const balanceOut = tokenOutInfo.rawPoolBalance;

      const weightInRaw = BigInt(
        Math.round(parseFloat(tokenInInfo.weight) * 100),
      );
      const weightOutRaw = BigInt(
        Math.round(parseFloat(tokenOutInfo.weight) * 100),
      );

      const amountInWithFee = amountIn * BigInt(997);
      const adjustedIn = amountInWithFee * weightInRaw;
      const denominator = balanceIn * weightOutRaw * BigInt(1000) + adjustedIn;
      const amountOut = (adjustedIn * balanceOut) / denominator;

      setSwapEstimatedOut(formatUnitsSafe(amountOut, tokenOutInfo.decimals, 6));
    } catch {
      setSwapEstimatedOut("0");
    }
  }

  async function swap() {
    if (!router || !account || !tokenInInfo || !tokenOutInfo) return;

    try {
      setLoading(true);

      if (swapTokenIn === swapTokenOut) {
        throw new Error("tokenIn 和 tokenOut 不能相同");
      }

      const amountIn = parseUnitsSafe(swapAmountIn, tokenInInfo.decimals);
      if (amountIn <= BigInt(0)) {
        throw new Error("请输入正确的输入数量");
      }

      if (amountIn > tokenInInfo.rawBalance) {
        throw new Error(`${tokenInInfo.symbol} 余额不足`);
      }

      await approveIfNeeded(tokenInInfo.address, amountIn);

      const tx = await router.swapExactTokenForToken(
        POOL_ADDRESS,
        tokenInInfo.address,
        tokenOutInfo.address,
        amountIn,
        BigInt(0),
        account,
        BigInt(makeDeadline(20)),
      );

      await tx.wait();

      setStatus("兑换成功");
      setSwapAmountIn("");
      setSwapEstimatedOut("0");
      await refreshAll();
    } catch (error: any) {
      console.error(error);
      setStatus(error?.shortMessage || error?.message || "兑换失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, [provider, account, pool, signer]);

  useEffect(() => {
    estimateSwap();
  }, [swapAmountIn, swapTokenIn, swapTokenOut, tokens]);

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
    status,
    nativeBalance,

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

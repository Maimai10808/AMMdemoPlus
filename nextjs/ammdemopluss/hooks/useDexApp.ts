// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { BrowserProvider, Contract } from "ethers";
// import { buildDexContracts } from "@/lib/contracts";
// import { formatUnitsSafe, makeDeadline, parseUnitsSafe } from "@/lib/format";
// import {
//   PAIR_ADDRESS,
//   TARGET_CHAIN_ID,
//   TOKEN0_ADDRESS,
//   TOKEN1_ADDRESS,
// } from "@/lib/config";

// declare global {
//   interface Window {
//     ethereum?: any;
//   }
// }

// export function useDexApp() {
//   const [provider, setProvider] = useState<BrowserProvider | null>(null);
//   const [signer, setSigner] = useState<any>(null);
//   const [account, setAccount] = useState("");

//   const [token0, setToken0] = useState<Contract | null>(null);
//   const [token1, setToken1] = useState<Contract | null>(null);
//   const [pair, setPair] = useState<Contract | null>(null);
//   const [router, setRouter] = useState<Contract | null>(null);

//   const [token0Symbol, setToken0Symbol] = useState("Token0");
//   const [token1Symbol, setToken1Symbol] = useState("Token1");

//   const [token0Decimals, setToken0Decimals] = useState(18);
//   const [token1Decimals, setToken1Decimals] = useState(18);

//   const [token0Balance, setToken0Balance] = useState("0");
//   const [token1Balance, setToken1Balance] = useState("0");
//   const [lpBalance, setLpBalance] = useState("0");
//   const [nativeBalance, setNativeBalance] = useState("0");

//   const [reserve0, setReserve0] = useState("0");
//   const [reserve1, setReserve1] = useState("0");

//   const [swapDirection, setSwapDirection] = useState<"0to1" | "1to0">("0to1");
//   const [swapInput, setSwapInput] = useState("");
//   const [swapQuote, setSwapQuote] = useState("0");

//   const [addAmount0, setAddAmount0] = useState("");
//   const [addAmount1, setAddAmount1] = useState("");

//   const [removeLpAmount, setRemoveLpAmount] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState("未连接钱包");

//   const outputTokenSymbol = useMemo(() => {
//     return swapDirection === "0to1" ? token1Symbol : token0Symbol;
//   }, [swapDirection, token0Symbol, token1Symbol]);

//   async function ensureNetwork() {
//     if (!window.ethereum) throw new Error("请先安装 MetaMask");

//     const hardhatHex = "0x7a69";

//     try {
//       await window.ethereum.request({
//         method: "wallet_switchEthereumChain",
//         params: [{ chainId: hardhatHex }],
//       });
//     } catch (err: any) {
//       if (err.code === 4902) {
//         await window.ethereum.request({
//           method: "wallet_addEthereumChain",
//           params: [
//             {
//               chainId: hardhatHex,
//               chainName: "Hardhat Local",
//               rpcUrls: ["http://127.0.0.1:8545"],
//               nativeCurrency: {
//                 name: "Ether",
//                 symbol: "ETH",
//                 decimals: 18,
//               },
//             },
//           ],
//         });
//       } else {
//         throw err;
//       }
//     }
//   }

//   async function connectWallet() {
//     try {
//       if (!window.ethereum) {
//         alert("请先安装 MetaMask");
//         return;
//       }

//       setLoading(true);
//       setStatus("正在切换网络并连接钱包...");

//       await ensureNetwork();

//       const accounts: string[] = await window.ethereum.request({
//         method: "eth_requestAccounts",
//       });

//       const currentAccount = accounts[0];
//       if (!currentAccount) throw new Error("没有可用账户");

//       const built = await buildDexContracts(window.ethereum, currentAccount);
//       setProvider(built.provider);
//       setSigner(built.signer);
//       setAccount(currentAccount);
//       setToken0(built.token0);
//       setToken1(built.token1);
//       setPair(built.pair);
//       setRouter(built.router);

//       const network = await built.provider.getNetwork();
//       if (Number(network.chainId) !== TARGET_CHAIN_ID) {
//         throw new Error(
//           `当前 chainId=${network.chainId.toString()}，不是本地链`,
//         );
//       }

//       setStatus(`钱包已连接: ${currentAccount}`);
//     } catch (error: any) {
//       console.error(error);
//       setStatus(error?.message || "连接失败");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function refreshAll() {
//     if (!account || !provider || !token0 || !token1 || !pair) return;

//     try {
//       const [s0, s1, d0, d1, b0, b1, lp, reserves, native] = await Promise.all([
//         token0.symbol(),
//         token1.symbol(),
//         token0.decimals(),
//         token1.decimals(),
//         token0.balanceOf(account),
//         token1.balanceOf(account),
//         pair.balanceOf(account),
//         pair.getReserves(),
//         provider.getBalance(account),
//       ]);

//       setToken0Symbol(s0);
//       setToken1Symbol(s1);
//       setToken0Decimals(Number(d0));
//       setToken1Decimals(Number(d1));

//       setToken0Balance(formatUnitsSafe(b0, Number(d0)));
//       setToken1Balance(formatUnitsSafe(b1, Number(d1)));
//       setLpBalance(formatUnitsSafe(lp, 18));
//       setNativeBalance(formatUnitsSafe(native, 18));

//       setReserve0(formatUnitsSafe(reserves.reserve0, Number(d0)));
//       setReserve1(formatUnitsSafe(reserves.reserve1, Number(d1)));
//     } catch (error: any) {
//       console.error(error);
//       setStatus(error?.message || "刷新数据失败");
//     }
//   }

//   async function approveIfNeeded(
//     tokenContract: Contract,
//     owner: string,
//     spender: string,
//     amount: bigint,
//   ) {
//     const allowance: bigint = await tokenContract.allowance(owner, spender);
//     if (allowance >= amount) return;

//     const tx = await tokenContract.approve(spender, amount);
//     await tx.wait();
//   }

//   async function quoteSwap() {
//     if (!pair || !swapInput || Number(swapInput) <= 0) {
//       setSwapQuote("0");
//       return;
//     }

//     try {
//       const reserves = await pair.getReserves();
//       const reserve0Raw: bigint = reserves.reserve0;
//       const reserve1Raw: bigint = reserves.reserve1;

//       const amountIn =
//         swapDirection === "0to1"
//           ? parseUnitsSafe(swapInput, token0Decimals)
//           : parseUnitsSafe(swapInput, token1Decimals);

//       if (amountIn <= BigInt(0)) {
//         setSwapQuote("0");
//         return;
//       }

//       const reserveIn = swapDirection === "0to1" ? reserve0Raw : reserve1Raw;
//       const reserveOut = swapDirection === "0to1" ? reserve1Raw : reserve0Raw;

//       const amountInWithFee = amountIn * BigInt(997);
//       const numerator = amountInWithFee * reserveOut;
//       const denominator = reserveIn * BigInt(1000) + amountInWithFee;
//       const amountOut = numerator / denominator;

//       setSwapQuote(
//         formatUnitsSafe(
//           amountOut,
//           swapDirection === "0to1" ? token1Decimals : token0Decimals,
//           6,
//         ),
//       );
//     } catch {
//       setSwapQuote("0");
//     }
//   }

//   async function swapExactTokens() {
//     if (!router || !token0 || !token1 || !account) return;

//     try {
//       setLoading(true);

//       const amountIn =
//         swapDirection === "0to1"
//           ? parseUnitsSafe(swapInput, token0Decimals)
//           : parseUnitsSafe(swapInput, token1Decimals);

//       const inputToken = swapDirection === "0to1" ? token0 : token1;
//       const path =
//         swapDirection === "0to1"
//           ? [TOKEN0_ADDRESS, TOKEN1_ADDRESS]
//           : [TOKEN1_ADDRESS, TOKEN0_ADDRESS];

//       await approveIfNeeded(inputToken, account, PAIR_ADDRESS, BigInt(0));
//       await approveIfNeeded(
//         inputToken,
//         account,
//         router.target as string,
//         amountIn,
//       );

//       const tx = await router.swapExactTokensForTokens(
//         amountIn,
//         BigInt(0),
//         path,
//         account,
//         makeDeadline(20),
//       );

//       await tx.wait();

//       setStatus("兑换成功");
//       setSwapInput("");
//       setSwapQuote("0");
//       await refreshAll();
//     } catch (error: any) {
//       console.error(error);
//       setStatus(error?.shortMessage || error?.message || "兑换失败");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function addLiquidity() {
//     if (!router || !token0 || !token1 || !account) return;

//     try {
//       setLoading(true);

//       const amount0 = parseUnitsSafe(addAmount0, token0Decimals);
//       const amount1 = parseUnitsSafe(addAmount1, token1Decimals);

//       await approveIfNeeded(token0, account, router.target as string, amount0);
//       await approveIfNeeded(token1, account, router.target as string, amount1);

//       const tx = await router.addLiquidity(
//         TOKEN0_ADDRESS,
//         TOKEN1_ADDRESS,
//         amount0,
//         amount1,
//         BigInt(0),
//         BigInt(0),
//         account,
//         makeDeadline(20),
//       );

//       await tx.wait();

//       setStatus("添加流动性成功");
//       setAddAmount0("");
//       setAddAmount1("");
//       await refreshAll();
//     } catch (error: any) {
//       console.error(error);
//       setStatus(error?.shortMessage || error?.message || "添加流动性失败");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function removeLiquidity() {
//     if (!router || !pair || !account) return;

//     try {
//       setLoading(true);

//       const liquidity = parseUnitsSafe(removeLpAmount, 18);

//       await approveIfNeeded(pair, account, router.target as string, liquidity);

//       const tx = await router.removeLiquidity(
//         TOKEN0_ADDRESS,
//         TOKEN1_ADDRESS,
//         liquidity,
//         BigInt(0),
//         BigInt(0),
//         account,
//         makeDeadline(20),
//       );

//       await tx.wait();

//       setStatus("移除流动性成功");
//       setRemoveLpAmount("");
//       await refreshAll();
//     } catch (error: any) {
//       console.error(error);
//       setStatus(error?.shortMessage || error?.message || "移除流动性失败");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     refreshAll();
//   }, [account, provider, token0, token1, pair]);

//   useEffect(() => {
//     quoteSwap();
//   }, [swapInput, swapDirection, pair, token0Decimals, token1Decimals]);

//   useEffect(() => {
//     if (!window.ethereum) return;

//     const onAccountsChanged = () => window.location.reload();
//     const onChainChanged = () => window.location.reload();

//     window.ethereum.on("accountsChanged", onAccountsChanged);
//     window.ethereum.on("chainChanged", onChainChanged);

//     return () => {
//       window.ethereum?.removeListener("accountsChanged", onAccountsChanged);
//       window.ethereum?.removeListener("chainChanged", onChainChanged);
//     };
//   }, []);

//   return {
//     account,
//     loading,
//     status,

//     token0Symbol,
//     token1Symbol,
//     token0Balance,
//     token1Balance,
//     lpBalance,
//     nativeBalance,
//     reserve0,
//     reserve1,

//     swapDirection,
//     setSwapDirection,
//     swapInput,
//     setSwapInput,
//     swapQuote,
//     outputTokenSymbol,

//     addAmount0,
//     setAddAmount0,
//     addAmount1,
//     setAddAmount1,

//     removeLpAmount,
//     setRemoveLpAmount,

//     connectWallet,
//     swapExactTokens,
//     addLiquidity,
//     removeLiquidity,
//   };
// }

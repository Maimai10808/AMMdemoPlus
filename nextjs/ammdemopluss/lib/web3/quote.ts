/**
 * 本地报价与估算工具
 *
 * 作用：
 * 1. 根据当前池子余额、权重、输入数量
 * 2. 在前端本地估算 swap 的预期输出数量
 *
 * 注意：
 * 这里是前端教学版近似估算，不是链上最终成交结果；
 * 真正执行时仍以合约内部计算为准。
 */

import { formatUnitsSafe, parseUnitsSafe } from "@/lib/format";
import type { PoolTokenInfo } from "@/lib/types";

export function estimateMultiPoolSwap(params: {
  tokenInInfo?: PoolTokenInfo;
  tokenOutInfo?: PoolTokenInfo;
  swapAmountIn: string;
  swapTokenIn: string;
  swapTokenOut: string;
}) {
  const { tokenInInfo, tokenOutInfo, swapAmountIn, swapTokenIn, swapTokenOut } =
    params;

  if (!tokenInInfo || !tokenOutInfo || !swapAmountIn) return "0";
  if (swapTokenIn === swapTokenOut) return "0";

  const amountIn = parseUnitsSafe(swapAmountIn, tokenInInfo.decimals);
  if (amountIn <= BigInt(0)) return "0";

  const balanceIn = tokenInInfo.rawPoolBalance;
  const balanceOut = tokenOutInfo.rawPoolBalance;

  const weightInRaw = BigInt(Math.round(parseFloat(tokenInInfo.weight) * 100));
  const weightOutRaw = BigInt(
    Math.round(parseFloat(tokenOutInfo.weight) * 100),
  );

  const amountInWithFee = amountIn * BigInt(997);
  const adjustedIn = amountInWithFee * weightInRaw;
  const denominator = balanceIn * weightOutRaw * BigInt(1000) + adjustedIn;
  const amountOut = (adjustedIn * balanceOut) / denominator;

  return formatUnitsSafe(amountOut, tokenOutInfo.decimals, 6);
}

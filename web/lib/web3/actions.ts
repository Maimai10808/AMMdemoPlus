/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 交易动作工具
 *
 * 作用：
 * 1. 封装 addLiquidity 交易流程
 * 2. 封装 removeLiquidity 交易流程
 * 3. 封装 swap 交易流程
 * 4. 在发送 Router 交易前，自动处理所需 token 的 approve
 *
 * 这一层专门负责“写链上交易”，是前端业务动作与合约交互的核心执行层。
 */

import { POOL_ADDRESS } from "@/lib/config";
import { makeDeadline, parseUnitsSafe } from "@/lib/format";
import { approveIfNeeded } from "./approvals";
import type { PoolTokenInfo } from "@/lib/types";

export async function addLiquidityAction(params: {
  router: any;
  account: string;
  tokens: PoolTokenInfo[];
  addAmounts: Record<string, string>;
  signer: any;
}) {
  const { router, account, tokens, addAmounts, signer } = params;

  const amountsIn: bigint[] = [];

  for (const token of tokens) {
    const input = addAmounts[token.address] || "";
    const amount = parseUnitsSafe(input, token.decimals);

    if (amount > token.rawBalance) {
      throw new Error(`${token.symbol} 余额不足`);
    }

    if (amount > BigInt(0)) {
      await approveIfNeeded({
        signer,
        account,
        tokenAddress: token.address,
        amount,
      });
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
}

export async function removeLiquidityAction(params: {
  router: any;
  pool: any;
  account: string;
  signer: any;
  removeLpAmount: string;
  lpRawBalance: bigint;
}) {
  const { router, account, signer, removeLpAmount, lpRawBalance } = params;

  const liquidityIn = parseUnitsSafe(removeLpAmount, 18);

  if (liquidityIn <= BigInt(0)) {
    throw new Error("请输入正确的 LP 数量");
  }

  if (liquidityIn > lpRawBalance) {
    throw new Error("LP 余额不足");
  }

  await approveIfNeeded({
    signer,
    account,
    tokenAddress: POOL_ADDRESS,
    amount: liquidityIn,
  });

  const tx = await router.removeLiquidity(
    POOL_ADDRESS,
    liquidityIn,
    account,
    BigInt(makeDeadline(20)),
  );

  await tx.wait();
}

export async function swapAction(params: {
  router: any;
  account: string;
  signer: any;
  tokenInInfo: PoolTokenInfo;
  tokenOutInfo: PoolTokenInfo;
  swapAmountIn: string;
}) {
  const { router, account, signer, tokenInInfo, tokenOutInfo, swapAmountIn } =
    params;

  const amountIn = parseUnitsSafe(swapAmountIn, tokenInInfo.decimals);

  if (amountIn <= BigInt(0)) {
    throw new Error("请输入正确的输入数量");
  }

  if (amountIn > tokenInInfo.rawBalance) {
    throw new Error(`${tokenInInfo.symbol} 余额不足`);
  }

  await approveIfNeeded({
    signer,
    account,
    tokenAddress: tokenInInfo.address,
    amount: amountIn,
  });

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
}

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Contract } from "ethers";
import { FAUCET_ADDRESS, POOL_ADDRESS, TOKENS } from "@/lib/config";
import { makeDeadline, parseUnitsSafe } from "@/lib/format";
import { approveIfNeeded } from "./approvals";
import type { PoolTokenInfo } from "@/lib/types";

export class DexActionError extends Error {
  code: string;
  tokenSymbol?: string;

  constructor(code: string, message: string, tokenSymbol?: string) {
    super(message);
    this.code = code;
    this.tokenSymbol = tokenSymbol;
  }
}

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
      throw new DexActionError(
        "INSUFFICIENT_BALANCE",
        `${token.symbol} balance is insufficient`,
        token.symbol,
      );
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
    throw new DexActionError("INVALID_AMOUNT", "Invalid LP amount");
  }

  if (liquidityIn > lpRawBalance) {
    throw new DexActionError(
      "INSUFFICIENT_BALANCE",
      "LP balance is insufficient",
      "LP Token",
    );
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
    throw new DexActionError("INVALID_AMOUNT", "Invalid input amount");
  }

  if (amountIn > tokenInInfo.rawBalance) {
    throw new DexActionError(
      "INSUFFICIENT_BALANCE",
      `${tokenInInfo.symbol} balance is insufficient`,
      tokenInInfo.symbol,
    );
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

export async function claimFaucetTokensAction(params: {
  signer: any;
  tokenAddress: string;
  amount: string;
  decimals: number;
}) {
  const { signer, tokenAddress, amount, decimals } = params;

  const tokenIndex = TOKENS.findIndex(
    (token) => token.address.toLowerCase() === tokenAddress.toLowerCase(),
  );

  if (tokenIndex === -1) {
    throw new DexActionError("INVALID_TOKEN", "Unsupported faucet token");
  }

  const parsedAmount = parseUnitsSafe(amount, decimals);

  if (parsedAmount <= BigInt(0)) {
    throw new DexActionError("INVALID_AMOUNT", "Invalid faucet amount");
  }

  const faucetAbi = ["function claim(uint256 index, uint256 amount) external"];
  const faucet = new Contract(FAUCET_ADDRESS, faucetAbi, signer);

  const tx = await faucet.claim(BigInt(tokenIndex), parsedAmount);
  await tx.wait();
}

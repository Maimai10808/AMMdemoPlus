/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 授权相关工具
 *
 * 作用：
 * 1. 查询 ERC20 allowance
 * 2. 判断当前授权额度是否足够
 * 3. 如果不足，则自动向目标 spender 发起 approve 交易
 *
 * 这一层只处理授权逻辑，避免在 add/remove/swap 中重复写 allowance/approve 代码。
 */

import { buildTokenContract } from "@/lib/contracts";
import { ROUTER_ADDRESS } from "@/lib/config";

export async function approveIfNeeded(params: {
  signer: any;
  account: string;
  tokenAddress: string;
  amount: bigint;
  spender?: string;
}) {
  const {
    signer,
    account,
    tokenAddress,
    amount,
    spender = ROUTER_ADDRESS,
  } = params;

  const token = buildTokenContract(tokenAddress, signer);
  const allowance: bigint = await token.allowance(account, spender);

  if (allowance >= amount) return;

  const tx = await token.approve(spender, amount);
  await tx.wait();
}

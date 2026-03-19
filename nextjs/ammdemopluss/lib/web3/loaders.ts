/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 链上数据读取工具
 *
 * 作用：
 * 1. 从 Pool 合约读取池子支持的全部 token 地址
 * 2. 读取每个 token 的 symbol、decimals、用户余额、池子余额、权重
 * 3. 读取用户 LP Token 余额
 * 4. 读取用户原生 ETH 余额
 *
 * 这一层专门负责“读取链上快照”，不负责发送交易。
 */

import { buildTokenContract } from "@/lib/contracts";
import { formatUnitsSafe } from "@/lib/format";
import type { PoolTokenInfo } from "@/lib/types";

export async function loadPoolSnapshot(params: {
  provider: any;
  signer: any;
  pool: any;
  account: string;
}) {
  const { provider, signer, pool, account } = params;

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

  return {
    tokens: tokenInfos,
    lpRawBalance: lp as bigint,
    lpBalance: formatUnitsSafe(lp, 18, 6),
    nativeBalance: formatUnitsSafe(native, 18, 6),
  };
}

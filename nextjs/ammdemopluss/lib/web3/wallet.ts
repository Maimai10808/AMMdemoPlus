/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 钱包与网络连接工具
 *
 * 作用：
 * 1. 检查浏览器是否安装 MetaMask
 * 2. 切换或添加 Hardhat 本地测试链
 * 3. 连接当前钱包账户
 * 4. 构建 provider、signer、pool、router 合约实例
 *
 * 这一层不负责业务逻辑，只负责把“前端连接链”的基础环境准备好。
 */

import { buildMultiDexContracts } from "@/lib/contracts";
import { TARGET_CHAIN_ID } from "@/lib/config";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function ensureHardhatNetwork() {
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

export async function connectMultiDexWallet() {
  if (!window.ethereum) {
    throw new Error("请先安装 MetaMask");
  }

  await ensureHardhatNetwork();

  const accounts: string[] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const currentAccount = accounts[0];
  if (!currentAccount) {
    throw new Error("没有可用账户");
  }

  const built = await buildMultiDexContracts(window.ethereum, currentAccount);
  const network = await built.provider.getNetwork();

  if (Number(network.chainId) !== TARGET_CHAIN_ID) {
    throw new Error(`当前 chainId=${network.chainId.toString()}，不是本地链`);
  }

  return {
    account: currentAccount,
    ...built,
  };
}

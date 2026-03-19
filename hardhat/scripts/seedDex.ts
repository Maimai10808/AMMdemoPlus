import hre from "hardhat";
import { parseEther } from "viem";

async function main() {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();

  // 这里改成你 deployDex.ts 输出的最新地址
  const token0Address = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  const token1Address = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
  const routerAddress = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9";
  const pairAddress = "0x75537828f2ce51be7289709686a69cbfdbb714f1";

  const token0 = await viem.getContractAt("MockERC20", token0Address);
  const token1 = await viem.getContractAt("MockERC20", token1Address);
  const router = await viem.getContractAt("DexRouter", routerAddress);
  const pair = await viem.getContractAt("DexPair", pairAddress);

  const amount0 = parseEther("1000");
  const amount1 = parseEther("3000000");

  const approve0 = await token0.write.approve([routerAddress, amount0], {
    account: walletClient.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: approve0 });

  const approve1 = await token1.write.approve([routerAddress, amount1], {
    account: walletClient.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: approve1 });

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

  const addLiq = await router.write.addLiquidity(
    [
      token0Address,
      token1Address,
      amount0,
      amount1,
      BigInt(0),
      BigInt(0),
      walletClient.account.address,
      deadline,
    ],
    { account: walletClient.account },
  );
  await publicClient.waitForTransactionReceipt({ hash: addLiq });

  const reserves = await pair.read.getReserves();
  console.log("reserve0:", reserves[0].toString());
  console.log("reserve1:", reserves[1].toString());
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

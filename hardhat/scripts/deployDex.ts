import hre from "hardhat";
import { parseEther } from "viem";

async function main() {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();

  const token0 = await viem.deployContract("MockERC20", [
    "Demo ETH",
    "dETH",
    18,
  ]);
  const token1 = await viem.deployContract("MockERC20", [
    "Demo USD",
    "dUSD",
    18,
  ]);
  const factory = await viem.deployContract("DexFactory", []);
  const router = await viem.deployContract("DexRouter", [factory.address]);

  console.log("token0:", token0.address);
  console.log("token1:", token1.address);
  console.log("factory:", factory.address);
  console.log("router:", router.address);

  // 给部署者 mint 一些测试币
  const mintHash0 = await token0.write.mint([
    walletClient.account.address,
    parseEther("10000"),
  ]);
  await publicClient.waitForTransactionReceipt({ hash: mintHash0 });

  const mintHash1 = await token1.write.mint([
    walletClient.account.address,
    parseEther("30000000"),
  ]);
  await publicClient.waitForTransactionReceipt({ hash: mintHash1 });

  // 创建交易对
  const createPairHash = await factory.write.createPair([
    token0.address,
    token1.address,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: createPairHash });

  const pairAddress = await factory.read.getPair([
    token0.address,
    token1.address,
  ]);
  console.log("pair:", pairAddress);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

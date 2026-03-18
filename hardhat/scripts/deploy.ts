import hre from "hardhat";
import { parseEther } from "viem";

async function main() {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();

  const tokenA = await viem.deployContract("MockERC20", [
    "Demo ETH",
    "dETH",
    18,
  ]);
  const tokenB = await viem.deployContract("MockERC20", [
    "Demo USD",
    "dUSD",
    18,
  ]);
  const factory = await viem.deployContract("DexFactory", []);
  const router = await viem.deployContract("DexRouter", [factory.address]);

  console.log("tokenA:", tokenA.address);
  console.log("tokenB:", tokenB.address);
  console.log("factory:", factory.address);
  console.log("router:", router.address);

  await publicClient.waitForTransactionReceipt({
    hash: await tokenA.write.mint([
      walletClient.account.address,
      parseEther("10000"),
    ]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenB.write.mint([
      walletClient.account.address,
      parseEther("30000000"),
    ]),
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

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
  const tokenC = await viem.deployContract("MockERC20", [
    "Demo BTC",
    "dBTC",
    18,
  ]);
  const tokenD = await viem.deployContract("MockERC20", [
    "Demo XRP",
    "dXRP",
    18,
  ]);
  const tokenE = await viem.deployContract("MockERC20", [
    "Demo DOGE",
    "dDOGE",
    18,
  ]);

  const factory = await viem.deployContract("MultiTokenFactory", []);
  const router = await viem.deployContract("MultiTokenRouter", []);

  console.log("tokenA:", tokenA.address);
  console.log("tokenB:", tokenB.address);
  console.log("tokenC:", tokenC.address);
  console.log("tokenD:", tokenD.address);
  console.log("tokenE:", tokenE.address);
  console.log("factory:", factory.address);
  console.log("router:", router.address);

  const tokens = [
    tokenA.address,
    tokenB.address,
    tokenC.address,
    tokenD.address,
    tokenE.address,
  ];
  const weights = [5000n, 2000n, 1000n, 1000n, 1000n]; // 50% / 20% / 10%/ 10%/ 10%

  const createPoolHash = await factory.write.createPool([tokens, weights], {
    account: walletClient.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: createPoolHash });

  const poolAddress = await factory.read.allPools([0n]);
  console.log("pool:", poolAddress);

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

  await publicClient.waitForTransactionReceipt({
    hash: await tokenC.write.mint([
      walletClient.account.address,
      parseEther("1000"),
    ]),
  });

  await publicClient.waitForTransactionReceipt({
    hash: await tokenD.write.mint([
      walletClient.account.address,
      parseEther("10000"),
    ]),
  });

  await publicClient.waitForTransactionReceipt({
    hash: await tokenE.write.mint([
      walletClient.account.address,
      parseEther("10000"),
    ]),
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

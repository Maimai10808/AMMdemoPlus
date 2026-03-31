import hre from "hardhat";
import { parseEther } from "viem";
import fs from "node:fs";
import path from "node:path";

type Deployment = {
  tokens: {
    tokenA: { address: `0x${string}`; symbol: string };
    tokenB: { address: `0x${string}`; symbol: string };
    tokenC: { address: `0x${string}`; symbol: string };
    tokenD: { address: `0x${string}`; symbol: string };
    tokenE: { address: `0x${string}`; symbol: string };
  };
  router: `0x${string}`;
  pool: `0x${string}`;
};

async function main() {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();

  const deploymentPath = path.join(
    process.cwd(),
    "deployments",
    "localhost.json",
  );
  const deployment = JSON.parse(
    fs.readFileSync(deploymentPath, "utf8"),
  ) as Deployment;

  const tokenAAddress = deployment.tokens.tokenA.address;
  const tokenBAddress = deployment.tokens.tokenB.address;
  const tokenCAddress = deployment.tokens.tokenC.address;
  const tokenDAddress = deployment.tokens.tokenD.address;
  const tokenEAddress = deployment.tokens.tokenE.address;
  const routerAddress = deployment.router;
  const poolAddress = deployment.pool;

  console.log("Using deployment file:", deploymentPath);
  console.log("tokenA:", tokenAAddress);
  console.log("tokenB:", tokenBAddress);
  console.log("tokenC:", tokenCAddress);
  console.log("tokenD:", tokenDAddress);
  console.log("tokenE:", tokenEAddress);
  console.log("router:", routerAddress);
  console.log("pool:", poolAddress);

  const tokenA = await viem.getContractAt("MockERC20", tokenAAddress);
  const tokenB = await viem.getContractAt("MockERC20", tokenBAddress);
  const tokenC = await viem.getContractAt("MockERC20", tokenCAddress);
  const tokenD = await viem.getContractAt("MockERC20", tokenDAddress);
  const tokenE = await viem.getContractAt("MockERC20", tokenEAddress);

  const router = await viem.getContractAt("MultiTokenRouter", routerAddress);

  const amountA = parseEther("1000");
  const amountB = parseEther("3000000");
  const amountC = parseEther("100");
  const amountD = parseEther("1000");
  const amountE = parseEther("1000");

  await publicClient.waitForTransactionReceipt({
    hash: await tokenA.write.approve([routerAddress, amountA], {
      account: walletClient.account,
    }),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenB.write.approve([routerAddress, amountB], {
      account: walletClient.account,
    }),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenC.write.approve([routerAddress, amountC], {
      account: walletClient.account,
    }),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenD.write.approve([routerAddress, amountD], {
      account: walletClient.account,
    }),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenE.write.approve([routerAddress, amountE], {
      account: walletClient.account,
    }),
  });

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

  await publicClient.waitForTransactionReceipt({
    hash: await router.write.addLiquidity(
      [
        poolAddress,
        [amountA, amountB, amountC, amountD, amountE],
        walletClient.account.address,
        deadline,
      ],
      { account: walletClient.account },
    ),
  });

  console.log("seed finished");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

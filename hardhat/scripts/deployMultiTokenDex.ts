import hre from "hardhat";
import { parseEther } from "viem";
import fs from "node:fs";
import path from "node:path";

function upsertEnvFile(filePath: string, values: Record<string, string>): void {
  const existing = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf8")
    : "";

  const lines = existing.split("\n").filter((line) => line.trim() !== "");

  const map = new Map<string, string>();

  for (const line of lines) {
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();
    map.set(key, value);
  }

  for (const [key, value] of Object.entries(values)) {
    map.set(key, value);
  }

  const nextContent = Array.from(map.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  fs.writeFileSync(filePath, `${nextContent}\n`, "utf8");
}

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
  const weights = [5000n, 2000n, 1000n, 1000n, 1000n];

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

  const chainId = Number(await publicClient.getChainId());

  const deployment = {
    network: "localhost",
    chainId,
    deployer: walletClient.account.address,
    tokens: {
      tokenA: {
        name: "Demo ETH",
        symbol: "dETH",
        address: tokenA.address,
        decimals: 18,
      },
      tokenB: {
        name: "Demo USD",
        symbol: "dUSD",
        address: tokenB.address,
        decimals: 18,
      },
      tokenC: {
        name: "Demo BTC",
        symbol: "dBTC",
        address: tokenC.address,
        decimals: 18,
      },
      tokenD: {
        name: "Demo XRP",
        symbol: "dXRP",
        address: tokenD.address,
        decimals: 18,
      },
      tokenE: {
        name: "Demo DOGE",
        symbol: "dDOGE",
        address: tokenE.address,
        decimals: 18,
      },
    },
    factory: factory.address,
    router: router.address,
    pool: poolAddress,
    poolConfig: {
      tokens,
      weights: weights.map((w) => w.toString()),
    },
    seededToDeployer: {
      dETH: parseEther("10000").toString(),
      dUSD: parseEther("30000000").toString(),
      dBTC: parseEther("1000").toString(),
      dXRP: parseEther("10000").toString(),
      dDOGE: parseEther("10000").toString(),
    },
    createdAt: new Date().toISOString(),
  };

  const deploymentsDir = path.join(process.cwd(), "deployments");
  const deploymentFile = path.join(deploymentsDir, "localhost.json");

  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2), "utf8");

  console.log(`deployment file saved to: ${deploymentFile}`);

  const webDir = path.resolve(process.cwd(), "../web");
  const webEnvFile = path.join(webDir, ".env.local");

  fs.mkdirSync(webDir, { recursive: true });

  upsertEnvFile(webEnvFile, {
    NEXT_PUBLIC_CHAIN_ID: String(chainId),
    NEXT_PUBLIC_POOL_ADDRESS: poolAddress,
    NEXT_PUBLIC_ROUTER_ADDRESS: router.address,
    NEXT_PUBLIC_FACTORY_ADDRESS: factory.address,
    NEXT_PUBLIC_TOKEN_A_ADDRESS: tokenA.address,
    NEXT_PUBLIC_TOKEN_B_ADDRESS: tokenB.address,
    NEXT_PUBLIC_TOKEN_C_ADDRESS: tokenC.address,
    NEXT_PUBLIC_TOKEN_D_ADDRESS: tokenD.address,
    NEXT_PUBLIC_TOKEN_E_ADDRESS: tokenE.address,
  });

  console.log(`frontend env file updated: ${webEnvFile}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

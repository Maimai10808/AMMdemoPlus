import hre from "hardhat";
import { parseEther } from "viem";
import fs from "node:fs";
import path from "node:path";

type Address = `0x${string}`;

async function main() {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();

  const owner = walletClient.account.address as Address;

  // If your MockERC20 constructor is:
  // constructor(string name_, string symbol_, uint8 decimals_, address initialOwner)
  // then keep the 4th param: owner
  const tokenA = await viem.deployContract("MockERC20", [
    "Demo ETH",
    "dETH",
    18,
    owner,
  ]);
  const tokenB = await viem.deployContract("MockERC20", [
    "Demo USD",
    "dUSD",
    18,
    owner,
  ]);
  const tokenC = await viem.deployContract("MockERC20", [
    "Demo BTC",
    "dBTC",
    18,
    owner,
  ]);
  const tokenD = await viem.deployContract("MockERC20", [
    "Demo XRP",
    "dXRP",
    18,
    owner,
  ]);
  const tokenE = await viem.deployContract("MockERC20", [
    "Demo DOGE",
    "dDOGE",
    18,
    owner,
  ]);

  const factory = await viem.deployContract("MultiTokenFactory", []);
  const router = await viem.deployContract("MultiTokenRouter", []);
  const faucet = await viem.deployContract("TokenFaucet", [owner]);

  console.log("tokenA:", tokenA.address);
  console.log("tokenB:", tokenB.address);
  console.log("tokenC:", tokenC.address);
  console.log("tokenD:", tokenD.address);
  console.log("tokenE:", tokenE.address);
  console.log("factory:", factory.address);
  console.log("router:", router.address);
  console.log("faucet:", faucet.address);

  const tokens: Address[] = [
    tokenA.address as Address,
    tokenB.address as Address,
    tokenC.address as Address,
    tokenD.address as Address,
    tokenE.address as Address,
  ];

  const weights = [5000n, 2000n, 1000n, 1000n, 1000n];

  const createPoolHash = await factory.write.createPool([tokens, weights], {
    account: walletClient.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: createPoolHash });

  const poolAddressResult = await factory.read.allPools([0n]);
  if (!poolAddressResult) {
    throw new Error("Pool address not found after createPool");
  }

  const poolAddress = poolAddressResult as Address;
  console.log("pool:", poolAddress);

  // Mint to deployer
  const deployerMint = {
    dETH: parseEther("10000"),
    dUSD: parseEther("30000000"),
    dBTC: parseEther("1000"),
    dXRP: parseEther("10000"),
    dDOGE: parseEther("10000"),
  };

  await publicClient.waitForTransactionReceipt({
    hash: await tokenA.write.mint([owner, deployerMint.dETH]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenB.write.mint([owner, deployerMint.dUSD]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenC.write.mint([owner, deployerMint.dBTC]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenD.write.mint([owner, deployerMint.dXRP]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenE.write.mint([owner, deployerMint.dDOGE]),
  });

  // Faucet reserve
  const faucetReserve = {
    dETH: parseEther("50000"),
    dUSD: parseEther("50000000"),
    dBTC: parseEther("5000"),
    dXRP: parseEther("50000"),
    dDOGE: parseEther("50000"),
  };

  await publicClient.waitForTransactionReceipt({
    hash: await tokenA.write.mint([owner, faucetReserve.dETH]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenB.write.mint([owner, faucetReserve.dUSD]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenC.write.mint([owner, faucetReserve.dBTC]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenD.write.mint([owner, faucetReserve.dXRP]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenE.write.mint([owner, faucetReserve.dDOGE]),
  });

  await publicClient.waitForTransactionReceipt({
    hash: await tokenA.write.transfer([
      faucet.address as Address,
      faucetReserve.dETH,
    ]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenB.write.transfer([
      faucet.address as Address,
      faucetReserve.dUSD,
    ]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenC.write.transfer([
      faucet.address as Address,
      faucetReserve.dBTC,
    ]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenD.write.transfer([
      faucet.address as Address,
      faucetReserve.dXRP,
    ]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await tokenE.write.transfer([
      faucet.address as Address,
      faucetReserve.dDOGE,
    ]),
  });

  await publicClient.waitForTransactionReceipt({
    hash: await faucet.write.addToken([
      tokenA.address as Address,
      parseEther("1000"),
    ]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await faucet.write.addToken([
      tokenB.address as Address,
      parseEther("1000000"),
    ]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await faucet.write.addToken([
      tokenC.address as Address,
      parseEther("100"),
    ]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await faucet.write.addToken([
      tokenD.address as Address,
      parseEther("1000"),
    ]),
  });
  await publicClient.waitForTransactionReceipt({
    hash: await faucet.write.addToken([
      tokenE.address as Address,
      parseEther("1000"),
    ]),
  });

  await publicClient.waitForTransactionReceipt({
    hash: await faucet.write.setCooldown([30n]),
  });

  const chainId = Number(await publicClient.getChainId());

  const deployment = {
    network: "localhost",
    chainId,
    deployer: owner,
    tokens: {
      tokenA: {
        name: "Demo ETH",
        symbol: "dETH",
        address: tokenA.address as Address,
        decimals: 18,
      },
      tokenB: {
        name: "Demo USD",
        symbol: "dUSD",
        address: tokenB.address as Address,
        decimals: 18,
      },
      tokenC: {
        name: "Demo BTC",
        symbol: "dBTC",
        address: tokenC.address as Address,
        decimals: 18,
      },
      tokenD: {
        name: "Demo XRP",
        symbol: "dXRP",
        address: tokenD.address as Address,
        decimals: 18,
      },
      tokenE: {
        name: "Demo DOGE",
        symbol: "dDOGE",
        address: tokenE.address as Address,
        decimals: 18,
      },
    },
    factory: factory.address as Address,
    router: router.address as Address,
    pool: poolAddress,
    faucet: faucet.address as Address,
    poolConfig: {
      tokens,
      weights: weights.map((w) => w.toString()),
    },
    faucetConfig: {
      cooldownSeconds: 30,
      claimAmounts: {
        dETH: parseEther("1000").toString(),
        dUSD: parseEther("1000000").toString(),
        dBTC: parseEther("100").toString(),
        dXRP: parseEther("1000").toString(),
        dDOGE: parseEther("1000").toString(),
      },
    },
    createdAt: new Date().toISOString(),
  };

  // 1) Write hardhat/deployments/localhost.json
  const outputDir = path.join(process.cwd(), "deployments");
  const outputFile = path.join(outputDir, "localhost.json");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(deployment, null, 2), "utf8");

  console.log(`deployment file saved to: ${outputFile}`);

  // 2) Write web/.env.local
  const webEnvPath = path.join(process.cwd(), "..", "web", ".env.local");

  const envContent = `NEXT_PUBLIC_CHAIN_ID=${chainId}
NEXT_PUBLIC_FACTORY_ADDRESS=${factory.address}
NEXT_PUBLIC_POOL_ADDRESS=${poolAddress}
NEXT_PUBLIC_ROUTER_ADDRESS=${router.address}
NEXT_PUBLIC_FAUCET_ADDRESS=${faucet.address}
NEXT_PUBLIC_TOKEN_A_ADDRESS=${tokenA.address}
NEXT_PUBLIC_TOKEN_B_ADDRESS=${tokenB.address}
NEXT_PUBLIC_TOKEN_C_ADDRESS=${tokenC.address}
NEXT_PUBLIC_TOKEN_D_ADDRESS=${tokenD.address}
NEXT_PUBLIC_TOKEN_E_ADDRESS=${tokenE.address}
`;

  fs.writeFileSync(webEnvPath, envContent, "utf8");

  console.log(`web env file saved to: ${webEnvPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

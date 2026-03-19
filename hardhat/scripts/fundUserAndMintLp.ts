import hre from "hardhat";
import { parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

async function main() {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  // ========= 这里改成你的真实地址 =========
  const token0Address = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // dETH
  const token1Address = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"; // dUSD
  const routerAddress = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9";
  const pairAddress = "0x75537828f2ce51be7289709686a69cbfdbb714f1";

  const userAddress = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";

  // 如果你想“以这个用户身份”去 addLiquidity，需要这个用户私钥
  // 这是 Hardhat 默认 Account #1 的私钥
  const userPrivateKey =
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

  const userAccount = privateKeyToAccount(userPrivateKey);
  const userWalletClient = await viem.getWalletClient(userAccount.address);

  const token0 = await viem.getContractAt("MockERC20", token0Address);
  const token1 = await viem.getContractAt("MockERC20", token1Address);
  const router = await viem.getContractAt("DexRouter", routerAddress);
  const pair = await viem.getContractAt("DexPair", pairAddress);

  console.log("Deployer:", deployer.account.address);
  console.log("User:", userAddress);

  // ========= 第一步：给用户 mint 一些 dETH / dUSD =========
  const mintToken0Amount = parseEther("100");
  const mintToken1Amount = parseEther("300000");

  const mint0Hash = await token0.write.mint([userAddress, mintToken0Amount], {
    account: deployer.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: mint0Hash });
  console.log("Minted dETH to user:", mintToken0Amount.toString());

  const mint1Hash = await token1.write.mint([userAddress, mintToken1Amount], {
    account: deployer.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: mint1Hash });
  console.log("Minted dUSD to user:", mintToken1Amount.toString());

  // ========= 第二步：让用户授权 Router =========
  // 这里我们拿其中一部分去加流动性，从而给用户铸造 LP
  const addToken0Amount = parseEther("10");
  const addToken1Amount = parseEther("30000");

  const approve0Hash = await token0.write.approve(
    [routerAddress, addToken0Amount],
    {
      account: userWalletClient.account,
    },
  );
  await publicClient.waitForTransactionReceipt({ hash: approve0Hash });
  console.log("User approved dETH to router");

  const approve1Hash = await token1.write.approve(
    [routerAddress, addToken1Amount],
    {
      account: userWalletClient.account,
    },
  );
  await publicClient.waitForTransactionReceipt({ hash: approve1Hash });
  console.log("User approved dUSD to router");

  // ========= 第三步：让用户 addLiquidity，自动获得 LP Token =========
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

  const addLiquidityHash = await router.write.addLiquidity(
    [
      token0Address,
      token1Address,
      addToken0Amount,
      addToken1Amount,
      BigInt(0),
      BigInt(0),
      userAddress,
      deadline,
    ],
    {
      account: userWalletClient.account,
    },
  );
  await publicClient.waitForTransactionReceipt({ hash: addLiquidityHash });
  console.log("User added liquidity and received LP token");

  // ========= 第四步：查询最终余额 =========
  const userToken0Balance = await token0.read.balanceOf([userAddress]);
  const userToken1Balance = await token1.read.balanceOf([userAddress]);
  const userLpBalance = await pair.read.balanceOf([userAddress]);

  console.log("Final user dETH balance:", userToken0Balance.toString());
  console.log("Final user dUSD balance:", userToken1Balance.toString());
  console.log("Final user LP balance:", userLpBalance.toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

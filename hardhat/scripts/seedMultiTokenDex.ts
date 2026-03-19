import hre from "hardhat";
import { parseEther } from "viem";

async function main() {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();

  // 改成部署输出地址
  const tokenAAddress = "0xe6e340d132b5f46d1e472debcd681b2abc16e57e";
  const tokenBAddress = "0xc3e53f4d16ae77db1c982e75a937b9f60fe63690";
  const tokenCAddress = "0x84ea74d481ee0a5332c457a4d796187f6ba67feb";
  const tokenDAddress = "0x9e545e3c0baab3e08cdfd552c960a1050f373042";
  const tokenEAddress = "0xa82ff9afd8f496c3d6ac40e2a0f282e47488cfc9";
  const routerAddress = "0x851356ae760d987e095750cceb3bc6014560891c";
  const poolAddress = "0x9467A509DA43CB50EB332187602534991Be1fEa4";

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

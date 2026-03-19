import hre from "hardhat";
import { parseEther } from "viem";

async function main() {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();

  const userAddress = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";

  const tokenAAddress = "0xe6e340d132b5f46d1e472debcd681b2abc16e57e"; // dETH
  const tokenBAddress = "0xc3e53f4d16ae77db1c982e75a937b9f60fe63690"; // dUSD
  const tokenCAddress = "0x84ea74d481ee0a5332c457a4d796187f6ba67feb"; // dBTC
  const tokenDAddress = "0x9e545e3c0baab3e08cdfd552c960a1050f373042"; // dXRP
  const tokenEAddress = "0xa82ff9afd8f496c3d6ac40e2a0f282e47488cfc9"; // dDOGE

  const tokenA = await viem.getContractAt("MockERC20", tokenAAddress);
  const tokenB = await viem.getContractAt("MockERC20", tokenBAddress);
  const tokenC = await viem.getContractAt("MockERC20", tokenCAddress);
  const tokenD = await viem.getContractAt("MockERC20", tokenDAddress);
  const tokenE = await viem.getContractAt("MockERC20", tokenEAddress);

  // 你可以改这里的数量
  const amountA = parseEther("100"); // 100 dETH
  const amountB = parseEther("500000"); // 500000 dUSD
  const amountC = parseEther("20"); // 20 dBTC
  const amountD = parseEther("100000"); // 100000 dXRP
  const amountE = parseEther("100000"); // 100000 dDOGE

  console.log("Minter:", walletClient.account.address);
  console.log("User:", userAddress);

  const mintAHash = await tokenA.write.mint([userAddress, amountA], {
    account: walletClient.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: mintAHash });
  console.log("Minted dETH:", amountA.toString());

  const mintBHash = await tokenB.write.mint([userAddress, amountB], {
    account: walletClient.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: mintBHash });
  console.log("Minted dUSD:", amountB.toString());

  const mintCHash = await tokenC.write.mint([userAddress, amountC], {
    account: walletClient.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: mintCHash });
  console.log("Minted dBTC:", amountC.toString());

  const mintDHash = await tokenD.write.mint([userAddress, amountD], {
    account: walletClient.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: mintDHash });
  console.log("Minted dXRP:", amountD.toString());

  const mintEHash = await tokenE.write.mint([userAddress, amountE], {
    account: walletClient.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: mintEHash });
  console.log("Minted dDOGE:", amountE.toString());

  const balances = await Promise.all([
    tokenA.read.balanceOf([userAddress]),
    tokenB.read.balanceOf([userAddress]),
    tokenC.read.balanceOf([userAddress]),
    tokenD.read.balanceOf([userAddress]),
    tokenE.read.balanceOf([userAddress]),
  ]);

  console.log("Final user balances:");
  console.log("dETH :", balances[0].toString());
  console.log("dUSD :", balances[1].toString());
  console.log("dBTC :", balances[2].toString());
  console.log("dXRP :", balances[3].toString());
  console.log("dDOGE:", balances[4].toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

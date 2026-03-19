"use client";

import WalletCard from "@/components/WalletCard";
import PoolOverviewCard from "@/components/PoolOverviewCard";
import AddLiquidityCard from "@/components/AddLiquidityCard";
import RemoveLiquidityCard from "@/components/RemoveLiquidityCard";
import SwapCard from "@/components/SwapCard";
import { useMultiTokenDex } from "@/hooks/useMultiTokenDex";

export default function Page() {
  const dex = useMultiTokenDex();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Multi Token Pool DEX Demo</h1>
          <p className="mt-2 text-slate-400">
            五币多池版 · Next.js + ethers v6 + Hardhat
          </p>
        </div>

        <WalletCard
          account={dex.account}
          nativeBalance={dex.nativeBalance}
          loading={dex.loading}
          status={dex.status}
          connectWallet={dex.connectWallet}
        />

        <PoolOverviewCard tokens={dex.tokens} lpBalance={dex.lpBalance} />

        <div className="grid gap-6 lg:grid-cols-3">
          <AddLiquidityCard
            tokens={dex.tokens}
            addAmounts={dex.addAmounts}
            setAddAmounts={dex.setAddAmounts}
            addLiquidity={dex.addLiquidity}
            loading={dex.loading}
          />

          <RemoveLiquidityCard
            removeLpAmount={dex.removeLpAmount}
            setRemoveLpAmount={dex.setRemoveLpAmount}
            removeLiquidity={dex.removeLiquidity}
            loading={dex.loading}
          />

          <SwapCard
            tokens={dex.tokens}
            swapTokenIn={dex.swapTokenIn}
            setSwapTokenIn={dex.setSwapTokenIn}
            swapTokenOut={dex.swapTokenOut}
            setSwapTokenOut={dex.setSwapTokenOut}
            swapAmountIn={dex.swapAmountIn}
            setSwapAmountIn={dex.setSwapAmountIn}
            swapEstimatedOut={dex.swapEstimatedOut}
            swap={dex.swap}
            loading={dex.loading}
          />
        </div>
      </div>
    </main>
  );
}

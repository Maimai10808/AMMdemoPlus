"use client";

import WalletCard from "@/components/WalletCard";
import PoolOverviewCard from "@/components/PoolOverviewCard";
import AddLiquidityCard from "@/components/AddLiquidityCard";
import RemoveLiquidityCard from "@/components/RemoveLiquidityCard";
import SwapCard from "@/components/SwapCard";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import FaucetDialog from "@/components/FaucetDialog";
import { useMultiTokenDex } from "@/hooks/useMultiTokenDex";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useTranslations } from "next-intl";

export default function Page() {
  const dex = useMultiTokenDex();
  const t = useTranslations("HomePage");

  return (
    <>
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
              <p className="mt-2 text-sm text-slate-400">{t("subtitle")}</p>
            </div>

            <LocaleSwitcher />
          </div>

          <WalletCard
            account={dex.account}
            nativeBalance={dex.nativeBalance}
            loading={dex.loading}
            statusKey={dex.statusKey}
            statusParams={dex.statusParams}
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

        <FaucetDialog
          open={dex.insufficientBalanceOpen}
          onOpenChange={dex.setInsufficientBalanceOpen}
          tokens={dex.tokens}
          tokenAddress={dex.faucetTokenAddress}
          setTokenAddress={dex.setFaucetTokenAddress}
          amount={dex.faucetAmount}
          setAmount={dex.setFaucetAmount}
          onClaim={dex.claimFaucetTokens}
          loading={dex.loading}
        />
      </main>
      <LoadingOverlay open={dex.loading} />
    </>
  );
}

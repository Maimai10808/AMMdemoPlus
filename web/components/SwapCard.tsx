"use client";

import type { PoolTokenInfo } from "@/lib/types";
import { useTranslations } from "next-intl";

type Props = {
  tokens: PoolTokenInfo[];
  swapTokenIn: string;
  setSwapTokenIn: (v: string) => void;
  swapTokenOut: string;
  setSwapTokenOut: (v: string) => void;
  swapAmountIn: string;
  setSwapAmountIn: (v: string) => void;
  swapEstimatedOut: string;
  swap: () => void;
  loading: boolean;
};

export default function SwapCard({
  tokens,
  swapTokenIn,
  setSwapTokenIn,
  swapTokenOut,
  setSwapTokenOut,
  swapAmountIn,
  setSwapAmountIn,
  swapEstimatedOut,
  swap,
  loading,
}: Props) {
  const t = useTranslations("SwapCard");

  const tokenOutSymbol =
    tokens.find((tkn) => tkn.address === swapTokenOut)?.symbol || "";

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold text-white">{t("title")}</h2>

      <div className="mt-4">
        <label className="mb-2 block text-sm text-slate-300">
          {t("tokenIn")}
        </label>
        <select
          value={swapTokenIn}
          onChange={(e) => setSwapTokenIn(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white"
        >
          {tokens.map((token) => (
            <option key={token.address} value={token.address}>
              {token.symbol}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm text-slate-300">
          {t("tokenOut")}
        </label>
        <select
          value={swapTokenOut}
          onChange={(e) => setSwapTokenOut(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white"
        >
          {tokens.map((token) => (
            <option key={token.address} value={token.address}>
              {token.symbol}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm text-slate-300">
          {t("amountIn")}
        </label>
        <input
          value={swapAmountIn}
          onChange={(e) => setSwapAmountIn(e.target.value)}
          placeholder={t("amountPlaceholder")}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white"
        />
      </div>

      <div className="mt-4 rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-300">
        {t("estimatedOut", {
          amount: swapEstimatedOut,
          symbol: tokenOutSymbol,
        })}
      </div>

      <button
        onClick={swap}
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {t("submit")}
      </button>
    </div>
  );
}

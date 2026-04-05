"use client";

import type { PoolTokenInfo } from "@/lib/types";
import { TOKENS } from "@/lib/config";
import { useTranslations } from "next-intl";

type Props = {
  tokens: PoolTokenInfo[];
  addAmounts: Record<string, string>;
  setAddAmounts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  addLiquidity: () => void;
  loading: boolean;
};

export default function AddLiquidityCard({
  tokens,
  addAmounts,
  setAddAmounts,
  addLiquidity,
  loading,
}: Props) {
  const t = useTranslations("AddLiquidityCard");

  const displayTokens =
    tokens.length > 0
      ? tokens
      : TOKENS.map((token) => ({
          address: token.address,
          symbol: token.symbol,
        }));

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold text-white">{t("title")}</h2>

      <div className="mt-4 space-y-4">
        {displayTokens.map((token) => (
          <div key={token.address}>
            <label className="mb-2 block text-sm text-slate-300">
              {t("amountLabel", { symbol: token.symbol })}
            </label>
            <input
              value={addAmounts[token.address] || ""}
              onChange={(e) =>
                setAddAmounts((prev) => ({
                  ...prev,
                  [token.address]: e.target.value,
                }))
              }
              placeholder={t("amountPlaceholder", { symbol: token.symbol })}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white"
            />
          </div>
        ))}
      </div>

      <button
        onClick={addLiquidity}
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-3 font-medium text-white hover:bg-violet-500 disabled:opacity-50"
      >
        {t("submit")}
      </button>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";

type Props = {
  removeLpAmount: string;
  setRemoveLpAmount: (v: string) => void;
  removeLiquidity: () => void;
  loading: boolean;
};

export default function RemoveLiquidityCard({
  removeLpAmount,
  setRemoveLpAmount,
  removeLiquidity,
  loading,
}: Props) {
  const t = useTranslations("RemoveLiquidityCard");

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold text-white">{t("title")}</h2>

      <div className="mt-4">
        <label className="mb-2 block text-sm text-slate-300">
          {t("lpAmountLabel")}
        </label>
        <input
          value={removeLpAmount}
          onChange={(e) => setRemoveLpAmount(e.target.value)}
          placeholder={t("lpAmountPlaceholder")}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white"
        />
      </div>

      <button
        onClick={removeLiquidity}
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-rose-600 px-4 py-3 font-medium text-white hover:bg-rose-500 disabled:opacity-50"
      >
        {t("submit")}
      </button>
    </div>
  );
}

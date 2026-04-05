"use client";

import { shortAddr } from "@/lib/format";
import { useTranslations } from "next-intl";

type Props = {
  account: string;
  nativeBalance: string;
  loading: boolean;
  statusKey: string;
  statusParams?: {
    account?: string;
    message?: string;
  };
  connectWallet: () => void;
};

export default function WalletCard({
  account,
  nativeBalance,
  loading,
  statusKey,
  statusParams,
  connectWallet,
}: Props) {
  const t = useTranslations("WalletCard");

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {account
              ? t("connected", { account: shortAddr(account) })
              : t("notConnected")}
          </p>
          {account && (
            <p className="mt-1 text-sm text-slate-400">
              {t("nativeBalance", { balance: nativeBalance })}
            </p>
          )}
        </div>

        <button
          onClick={connectWallet}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {account ? t("reconnect") : t("connect")}
        </button>
      </div>

      <div className="mt-4 rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-300">
        {t("statusLabel")}:{" "}
        {t(`statusValues.${statusKey}`, {
          account: statusParams?.account ?? "",
          message: statusParams?.message ?? "",
        })}
      </div>
    </div>
  );
}

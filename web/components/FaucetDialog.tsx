"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PoolTokenInfo } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokens: PoolTokenInfo[];
  tokenAddress: string;
  setTokenAddress: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  onClaim: () => void;
  loading: boolean;
};

export default function FaucetDialog({
  open,
  onOpenChange,
  tokens,
  tokenAddress,
  setTokenAddress,
  amount,
  setAmount,
  onClaim,
  loading,
}: Props) {
  const t = useTranslations("FaucetDialog");

  const selectedToken = useMemo(
    () => tokens.find((token) => token.address === tokenAddress),
    [tokens, tokenAddress],
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-slate-700 bg-slate-900 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            {t("description")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              {t("tokenLabel")}
            </label>
            <select
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white disabled:opacity-50"
            >
              {tokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              {t("amountLabel")}
            </label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              placeholder={
                selectedToken
                  ? t("amountPlaceholder", { symbol: selectedToken.symbol })
                  : t("amountPlaceholder", { symbol: "token" })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white disabled:opacity-50"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {t("cancel")}
          </AlertDialogCancel>

          <button
            onClick={onClaim}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("loading")}
              </span>
            ) : (
              t("claim")
            )}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

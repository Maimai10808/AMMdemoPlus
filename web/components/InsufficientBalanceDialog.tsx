"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
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
  tokenSymbol: string;
  onMint: () => void;
  loading: boolean;
};

export default function InsufficientBalanceDialog({
  open,
  onOpenChange,
  tokenSymbol,
  onMint,
  loading,
}: Props) {
  const t = useTranslations("InsufficientBalanceDialog");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-slate-700 bg-slate-900 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            {t("description", { symbol: tokenSymbol || "token" })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {t("cancel")}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onMint}
            disabled={loading}
            className="bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("loading")}
              </span>
            ) : (
              t("mint")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

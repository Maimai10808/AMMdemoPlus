"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  open: boolean;
};

export default function LoadingOverlay({ open }: Props) {
  const t = useTranslations("LoadingOverlay");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex min-w-[280px] flex-col items-center rounded-2xl border border-slate-700 bg-slate-900 px-8 py-6 shadow-2xl">
        <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
        <p className="mt-4 text-base font-medium text-white">{t("title")}</p>
        <p className="mt-2 text-center text-sm text-slate-300">
          {t("description")}
        </p>
      </div>
    </div>
  );
}

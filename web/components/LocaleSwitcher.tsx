"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const localeOptions = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "hi", label: "हिन्दी" },
] as const;

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("LocaleSwitcher");

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 shadow-lg backdrop-blur">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
        <Globe className="h-5 w-5" />
      </div>

      <div className="min-w-[180px] flex items-center justify-center gap-5 ">
        <p className="mb-1  font-medium  tracking-[0.2em] text-white text-xl">
          {t("label")}
        </p>

        <Select
          value={locale}
          onValueChange={(nextLocale) => {
            router.replace(pathname, { locale: nextLocale });
          }}
        >
          <SelectTrigger className="h-11 rounded-xl border-slate-700 bg-slate-800 text-white">
            <SelectValue placeholder={t("placeholder")} />
          </SelectTrigger>

          <SelectContent className="border-slate-700 bg-slate-900 text-white">
            {localeOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="focus:bg-slate-800 focus:text-white"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

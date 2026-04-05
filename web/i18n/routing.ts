import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh", "ja", "fr", "de", "hi"],
  defaultLocale: "en",
});

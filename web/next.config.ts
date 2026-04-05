import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // 你的其他 Next.js 配置写这里
};

export default withNextIntl(nextConfig);

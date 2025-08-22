import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  eslint: {
    // Игнорируем ошибки ESLint во время сборки, чтобы не блокировать деплой из-за линтинга
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

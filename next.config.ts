import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/dashboard",
  env: {
    NEXTAUTH_URL: 'http://localhost/dashboard',
    NEXTAUTH_SECRET: 'your-secret-key-here-change-in-production',
  },
};

export default nextConfig;

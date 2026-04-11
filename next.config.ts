import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/plan",
  env: {
    NEXTAUTH_URL: 'http://localhost/plan',
    NEXTAUTH_SECRET: 'your-secret-key-here-change-in-production',
  },
};

export default nextConfig;

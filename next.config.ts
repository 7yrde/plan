import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/plan",
  env: {
    NEXTAUTH_URL: 'http://localhost/plan',
    NEXTAUTH_SECRET: 'your-secret-key-here-change-in-production',
    JIRA_BASE_URL: process.env.JIRA_BASE_URL || 'https://7yr.atlassian.net',
    JIRA_EMAIL: process.env.JIRA_EMAIL || '',
    JIRA_PAT: process.env.JIRA_PAT || '',
  },
};

export default nextConfig;

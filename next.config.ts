import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/plan",
  // env 블록 사용 시 빌드 시점에 값이 inline되어 시크릿(JIRA_PAT 등)이 컨테이너에 hardcode됨.
  // 모든 env 변수는 lib/jira.ts 등에서 process.env로 직접 runtime 주입한다.
};

export default nextConfig;

import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages
  ? (process.env.GITHUB_PAGES_BASE_PATH ?? "/hud-robotics-page")
  : "";

const nextConfig: NextConfig = {
  ...(isGithubPages ? { output: "export" as const } : {}),
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
};

export default nextConfig;

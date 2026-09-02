import path from "node:path";
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  outputFileTracingRoot: path.join(import.meta.dirname),
};

export default config;

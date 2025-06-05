import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/': ['./src/assets/*'],
  }
};

export default nextConfig;

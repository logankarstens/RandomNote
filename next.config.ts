import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  rewrites: async() => {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
      
    ]
  },
  compiler: {
    removeConsole: false,
  }
};

export default nextConfig;

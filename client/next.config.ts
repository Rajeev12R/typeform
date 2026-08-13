import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.API_URL 
          ? `${process.env.API_URL}/api/:path*` 
          : "https://typeform-00l6.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;

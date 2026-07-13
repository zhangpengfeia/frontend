/** @type {import('next').NextConfig} */

const BASE_URL = process.env.NEXT_BASE_URL || "http://localhost:7001";

const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BASE_URL}api/:path*`,
      },
      {
        source: "/res/:path*",
        destination: `${BASE_URL}res/:path*`,
      },
      {
        source: "/static/:path*",
        destination: `${BASE_URL}static/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

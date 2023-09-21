/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  output: "standalone",
  images: {
    remotePatterns: [
      // User avatars
      {
        hostname: "*.googleusercontent.com",
        protocol: "https",
      },
    ],
  },
};

module.exports = nextConfig;

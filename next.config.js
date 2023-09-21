/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      // User avatars
      {
        hostname: "*.googleusercontent.com",
        protocol: "https",
      }
    ]
  }
};

module.exports = nextConfig;

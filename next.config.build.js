// This config file contains only the necessary next config needed in production
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      // User avatars
      {
        hostname: "*.googleusercontent.com",
        pathname: "**",
        protocol: "https",
      },
      {
        hostname: "secure.gravatar.com",
        protocol: "https",
      },
      {
        hostname: "*.slack-edge.com",
        protocol: "https",
      },
    ],
  },
};

module.exports = nextConfig;

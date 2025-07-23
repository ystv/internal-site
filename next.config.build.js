// This config file contains only the necessary next config needed in production
const { withSentryConfig } = require("@sentry/nextjs");

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

const sentryWebpackPluginOptions = {
  org: "ystv",
  project: "internal-site",
};

const sentryOptions = {
  // Upload additional client files (increases upload size)
  widenClientFileUpload: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,
};

module.exports = withSentryConfig(
  nextConfig,
  sentryWebpackPluginOptions,
  sentryOptions,
);

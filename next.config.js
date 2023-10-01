const { withSentryConfig } = require("@sentry/nextjs");
const { execFileSync } = require("child_process");

const gitCommit =
  process.env.GIT_REV ??
  execFileSync("/usr/bin/git", ["rev-parse", "HEAD"]).toString().trim();

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
  env: {
    NEXT_PUBLIC_GIT_COMMIT: gitCommit,
  },
  //// This stuff is useful for developing the yarn patch to FullCalendar
  // webpack: (
  //   config,
  //   { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack },
  // ) => {
  //   if (dev) {
  //     config.watchOptions = {
  //       followSymlinks: true,
  //     };
  //
  //     config.snapshot.managedPaths = [
  //       /^(.+?[\\/]node_modules[\\/])(?!@fullcalendar)/,
  //     ];
  //   }
  //   return config;
  // },
};

module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "ystv",
    project: "calendar2023",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);

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

module.exports = nextConfig;

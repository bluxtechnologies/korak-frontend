/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/overview",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/auth/reset-password",
        destination: "/reset-password",
      },
      {
        source: "/auth/login",
        destination: "/login",
      },
      {
        source: "/auth/register",
        destination: "/register",
      },
      {
        source: "/auth/forgot-password",
        destination: "/forgot-password",
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.openfoodfacts.org",
      },
      {
        protocol: "https",
        hostname: "**.openfoodfacts.net",
      },
      {
        protocol: "https",
        hostname: "static.ah.nl",
      },
    ],
  },
};

export default nextConfig;

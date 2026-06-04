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
      {
        protocol: "https",
        hostname: "www.lidl.nl",
      },
      {
        protocol: "https",
        hostname: "**.assets.schwarz",
      },
    ],
  },
};

export default nextConfig;

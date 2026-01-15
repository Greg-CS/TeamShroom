/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.pokemondb.net',
        pathname: '/sprites/**',
      },
    ],
  },
};

module.exports = nextConfig;

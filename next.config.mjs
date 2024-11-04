/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
      remotePatterns: ['cdn-zlib.sk'],
    },
};

export default nextConfig;

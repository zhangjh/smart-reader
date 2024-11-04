/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
      domains: ['s3proxy.cdn-zlib.sk'],
    },
};

export default nextConfig;

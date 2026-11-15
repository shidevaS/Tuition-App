/** @type {import('next').NextConfig} */
const nextConfig = {  reactStrictMode: true,  transpilePackages: ["@tuiton/shared", "@tuiton/db"],  experimental: { serverActions: { bodySizeLimit: "2mb" } },  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,};
module.exports = nextConfig;

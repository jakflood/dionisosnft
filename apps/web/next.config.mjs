/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workspace packages ship TS/ESM; Next should transpile them.
  transpilePackages: ['@dionisos/shared'],
};

export default nextConfig;

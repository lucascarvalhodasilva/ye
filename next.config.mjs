/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'export',
  
  // Empty turbopack config to silence the warning
  turbopack: {},
  
  // Required for react-pdf to work with webpack (fallback)
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;

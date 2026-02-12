/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@agentic-zero/core'], // Important for local workspace logic
    webpack: (config) => {
        config.externals = [...(config.externals || []), { canvas: 'canvas' }]; // Fix for three.js in some envs
        return config;
    },
};

export default nextConfig;

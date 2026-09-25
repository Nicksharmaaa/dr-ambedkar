/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['three', '3d-force-graph', 'react-force-graph-3d', 'three-render-objects', 'three-forcegraph'],
  async rewrites() {
    const rawUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const backendBase = rawUrl.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${backendBase}/storage/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

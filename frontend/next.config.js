/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['three', '3d-force-graph', 'react-force-graph-3d', 'three-render-objects', 'three-forcegraph'],
  async redirects() {
    return [
      {
        source: '/memorial',
        destination: '/memorials',
        permanent: true,
      },
      {
        source: '/presevation',
        destination: '/preservation',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    let rawUrl = (
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000"
    ).trim();
    rawUrl = rawUrl.replace(/^["']|["']$/g, '');
    if (!rawUrl || rawUrl === "" || rawUrl.startsWith("/")) {
      rawUrl = "http://127.0.0.1:8000";
    }
    if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
      rawUrl = `https://${rawUrl}`;
    }
    const backendBase = rawUrl.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '').replace(/\/+$/, '');
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

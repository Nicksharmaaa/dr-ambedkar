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
      "https://tear-venture-suppliers-many.trycloudflare.com"
    ).trim();
    rawUrl = rawUrl.replace(/^["']|["']$/g, '');
    if (!rawUrl || rawUrl === "" || rawUrl.startsWith("/")) {
      rawUrl = "https://tear-venture-suppliers-many.trycloudflare.com";
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
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

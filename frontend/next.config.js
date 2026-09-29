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
      ""
    ).trim();
    rawUrl = rawUrl.replace(/^["']|["']$/g, '');

    // In local development or self-hosted, default to local backend
    if (!rawUrl || rawUrl === "" || rawUrl.startsWith("/")) {
      if (process.env.VERCEL) {
        // On Vercel, never default to 127.0.0.1 as Vercel blocks private IPs (404 DNS_HOSTNAME_RESOLVED_PRIVATE)
        return [];
      }
      rawUrl = "http://127.0.0.1:8000";
    }

    if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
      rawUrl = `https://${rawUrl}`;
    }

    // Guard: Vercel blocks rewrites to loopback/private IPs
    if (process.env.VERCEL && (rawUrl.includes("localhost") || rawUrl.includes("127.0.0.1"))) {
      console.warn(
        "[Vercel Rewrites] Private IP detected in BACKEND_INTERNAL_URL/NEXT_PUBLIC_API_URL. " +
        "Skipping edge rewrites to prevent 404 DNS_HOSTNAME_RESOLVED_PRIVATE. " +
        "Please provide a public HTTPS backend URL in Vercel Environment Variables."
      );
      return [];
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
      {
        source: "/incoming_documents/:path*",
        destination: `${backendBase}/incoming_documents/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

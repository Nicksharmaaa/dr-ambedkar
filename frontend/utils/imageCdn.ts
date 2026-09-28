/**
 * Zero-Cost Image CDN & Optimization Utility for GitHub-hosted assets.
 * Converts raw GitHub URLs into global edge-cached CDN URLs (jsDelivr / Statically)
 * with HTTP/2 multiplexing, Brotli compression, and zero rate limits.
 */

export function getCdnImageUrl(url: string | undefined): string {
  if (!url) return '/images/ambedkar_portrait_1950.jpg';

  // If local static asset, return directly
  if (url.startsWith('/')) return url;

  // 1. Convert raw.githubusercontent.com to free jsDelivr global multi-CDN
  // Format: https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
  // Target: https://cdn.jsdelivr.net/gh/{owner}/{repo}@{branch}/{path}
  const rawGhMatch = url.match(/https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)/);
  if (rawGhMatch) {
    const [, owner, repo, branch, filePath] = rawGhMatch;
    return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${filePath}`;
  }

  // 2. Convert standard github.com blob URLs to jsDelivr
  // Format: https://github.com/{owner}/{repo}/blob/{branch}/{path}
  const blobGhMatch = url.match(/https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
  if (blobGhMatch) {
    const [, owner, repo, branch, filePath] = blobGhMatch;
    return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${filePath}`;
  }

  return url;
}

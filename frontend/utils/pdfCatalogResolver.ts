/**
 * Resolves local and incoming document PDF paths to their authentic online
 * Ministry of External Affairs (MEA) and National Digital Archive sources.
 *
 * Eliminates 404 Not Found errors on production deployments (e.g. Vercel)
 * where local 1.2GB PDF directories are not bundled.
 */

const MEA_BASE = "https://www.mea.gov.in/images/CPV";

/**
 * Maps volume numbers and language codes to official public archive URLs.
 */
export function getPublicVolumePdfUrl(
  folder: string,
  volumeNumber: string | number,
  filename?: string
): string | null {
  const normFolder = (folder || "").toLowerCase();
  const volStr = String(volumeNumber || "").trim().replace(/^0+/, "");
  const volNum = parseInt(volStr, 10);

  // 1. Hindi BAWS Volumes (Vol 1 to 40)
  if (normFolder === "hindi" || (filename && /^(dummy|hindi_vol|vol)\d+/i.test(filename))) {
    let effectiveVol = volNum;
    if (isNaN(effectiveVol) && filename) {
      const match = filename.match(/\d+/);
      if (match) effectiveVol = parseInt(match[0], 10);
    }
    if (!isNaN(effectiveVol) && effectiveVol >= 1 && effectiveVol <= 40) {
      return `${MEA_BASE}/VolumeH${effectiveVol}.pdf`;
    }
  }

  // 2. English BAWS Volumes (Vol 1 to 22)
  if (normFolder === "english" || (filename && /^volume_/i.test(filename))) {
    let effectiveVol = volNum;
    if (isNaN(effectiveVol) && filename) {
      const match = filename.match(/\d+/);
      if (match) effectiveVol = parseInt(match[0], 10);
    }

    // Special parts
    if (filename && filename.includes("14_01")) return `${MEA_BASE}/Volume14_Part_I.pdf`;
    if (filename && filename.includes("14_02")) return `${MEA_BASE}/Volume14_Part_II.pdf`;
    if (filename && filename.includes("17_01")) return `${MEA_BASE}/Volume17_Part_I.pdf`;
    if (filename && filename.includes("17_02")) return `${MEA_BASE}/Volume17_Part_II.pdf`;

    if (!isNaN(effectiveVol) && effectiveVol >= 1 && effectiveVol <= 22) {
      return `${MEA_BASE}/Volume${effectiveVol}.pdf`;
    }
  }

  return null;
}

/**
 * Resolves a given incoming_documents path or filename to a working public URL.
 */
export function resolveIncomingDocumentUrl(pathOrFilename: string): string {
  if (!pathOrFilename) return "";
  
  // Already external absolute URL
  if (pathOrFilename.startsWith("http://") || pathOrFilename.startsWith("https://")) {
    return pathOrFilename;
  }

  const clean = pathOrFilename.replace(/^\/+/, "");
  const parts = clean.split("/");
  const filename = parts[parts.length - 1] || "";
  const folder = parts.length > 2 ? parts[parts.length - 2] : parts[0] || "";

  // Extract volume number from filename (e.g. dummy13.pdf -> 13, hindi_vol1.pdf -> 1, vol22.pdf -> 22)
  const numMatch = filename.match(/\d+/);
  const volumeNumber = numMatch ? numMatch[0] : "";

  const publicUrl = getPublicVolumePdfUrl(folder, volumeNumber, filename);
  if (publicUrl) {
    return publicUrl;
  }

  // Default to keeping the relative path
  return pathOrFilename.startsWith("/") ? pathOrFilename : `/${pathOrFilename}`;
}

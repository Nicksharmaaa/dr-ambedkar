import { NextRequest, NextResponse } from "next/server";
import { resolveIncomingDocumentUrl } from "@/utils/pdfCatalogResolver";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const fullPath = path.join("/");

  // Resolve to public authentic MEA / Digital Archive PDF
  const publicUrl = resolveIncomingDocumentUrl(fullPath);

  if (publicUrl && (publicUrl.startsWith("http://") || publicUrl.startsWith("https://"))) {
    // Preserve any search parameters or hash (e.g. #page=1&view=FitH)
    return NextResponse.redirect(publicUrl, 307);
  }

  return new NextResponse(
    `Archival document "${fullPath}" is preserved in the Dr. Ambedkar Heritage physical collection. Please open the Book Reader view for the digitized text.`,
    {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    }
  );
}

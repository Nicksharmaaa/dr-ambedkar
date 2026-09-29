"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { ArchivalViewer } from "@/components/viewer/ArchivalViewer";

export default function DocumentViewerPageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();

  const docId = resolvedParams.id;
  const initialPage = searchParams.get("page")
    ? parseInt(searchParams.get("page")!, 10)
    : 1;
  const initialQuery = searchParams.get("query") || "";
  const initialTab = searchParams.get("tab") || searchParams.get("mode") || undefined;
  const initialFile = searchParams.get("file") || undefined;

  return (
    <ArchivalViewer
      documentId={docId}
      initialPage={isNaN(initialPage) ? 1 : initialPage}
      initialQuery={initialQuery}
      initialTab={initialTab}
      initialFile={initialFile}
    />
  );
}

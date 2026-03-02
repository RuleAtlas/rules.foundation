"use client";

import { use } from "react";
import { AtlasBrowser } from "@/components/atlas/document-browser";

/* v8 ignore start -- Next.js async params wrapper */
export default function BrowsePage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments } = use(params);
  return (
    <div className="relative z-1 py-16 px-8">
      <AtlasBrowser segments={segments || []} />
    </div>
  );
}
/* v8 ignore stop */

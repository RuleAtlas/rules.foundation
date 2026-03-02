"use client";

import { useRouter } from "next/navigation";
import { RuleDetailPanel } from "@/components/atlas/rule-detail-panel";
import type { ViewerDocument } from "@/lib/atlas-utils";
import type { Rule } from "@/lib/supabase";

export function RulePageClient({
  document,
  rule,
}: {
  document: ViewerDocument;
  rule: Rule;
}) {
  const router = useRouter();

  return (
    <div className="relative z-1 min-h-[calc(100vh-200px)]">
      <RuleDetailPanel
        document={document}
        rule={rule}
        onBack={() => router.push("/atlas")}
      />
    </div>
  );
}

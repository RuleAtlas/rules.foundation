"use client";

import { useRule } from "@/hooks/use-rules";
import { RuleDetailPanel } from "@/components/atlas/rule-detail-panel";
import { transformRuleToViewerDoc } from "@/lib/atlas-utils";
import { useRouter } from "next/navigation";

export function RuleViewer({ ruleId }: { ruleId: string }) {
  const { rule, children, loading, error } = useRule(ruleId);
  const router = useRouter();

  if (loading) {
    return (
      <div className="relative z-1 py-32 px-8 text-center text-[var(--color-text-muted)]">
        Loading rule...
      </div>
    );
  }

  if (error || !rule) {
    return (
      <div className="relative z-1 py-32 px-8 text-center">
        <p className="text-[var(--color-text-muted)] mb-4">
          {error || "Rule not found."}
        </p>
        <button
          className="btn-outline"
          onClick={() => router.push("/atlas")}
        >
          Back to Atlas
        </button>
      </div>
    );
  }

  const doc = transformRuleToViewerDoc(rule, children);

  return (
    <div className="relative z-1 min-h-[calc(100vh-200px)]">
      <RuleDetailPanel
        document={doc}
        rule={rule}
        onBack={() => router.push("/atlas")}
      />
    </div>
  );
}

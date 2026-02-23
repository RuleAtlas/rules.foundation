"use client";

import { use } from "react";
import { useRule } from "@/hooks/use-rules";
import { DocumentViewer } from "@/components/atlas/document-viewer";
import { useRouter } from "next/navigation";
import type { Rule } from "@/lib/supabase";

export function transformRuleToDoc(rule: Rule, children: Rule[]) {
  const subsections = children.map((child, i) => ({
    id: String.fromCharCode(97 + i),
    text: child.body || child.heading || "",
  }));

  if (subsections.length === 0 && rule.body) {
    const paragraphs = rule.body.split(/\n\n+/).filter(Boolean);
    paragraphs.forEach((para, i) => {
      subsections.push({
        id: String.fromCharCode(97 + i),
        text: para.trim(),
      });
    });
  }

  if (subsections.length === 0) {
    subsections.push({
      id: "a",
      text: rule.heading || "No content available.",
    });
  }

  return {
    citation: rule.source_path || rule.id,
    title: rule.heading || "Untitled",
    subsections,
    hasRac: rule.has_rac,
    jurisdiction: rule.jurisdiction,
    archPath: rule.source_path,
  };
}

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

  const doc = transformRuleToDoc(rule, children);

  return (
    <div className="relative z-1 min-h-[calc(100vh-200px)]">
      <DocumentViewer
        document={doc}
        onBack={() => router.push("/atlas")}
      />
    </div>
  );
}

/* v8 ignore start -- Next.js async params wrapper, tested via RuleViewer */
export default function RulePage({
  params,
}: {
  params: Promise<{ ruleId: string }>;
}) {
  const { ruleId } = use(params);
  return <RuleViewer ruleId={ruleId} />;
}
/* v8 ignore stop */

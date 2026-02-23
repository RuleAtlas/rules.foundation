"use client";

import { useState, useMemo, useCallback } from "react";
import { supabaseArch, type Rule } from "@/lib/supabase";
import { useRules, type RuleStats } from "@/hooks/use-rules";
import { RuleTree } from "./rule-tree";
import { DocumentViewer } from "./document-viewer";

interface ViewerDocument {
  citation: string;
  title: string;
  subsections: Array<{ id: string; text: string }>;
  hasRac: boolean;
  jurisdiction: string;
  archPath: string | null;
}

function transformRuleToViewerDoc(
  rule: Rule,
  children: Rule[]
): ViewerDocument {
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

function StatsBadge({ stats }: { stats: RuleStats[] }) {
  const total = stats.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return null;

  return (
    <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
      {stats.map((s) => (
        <span key={s.jurisdiction}>
          <span className="font-semibold text-[var(--color-text-secondary)]">
            {s.jurisdiction.toUpperCase()}
          </span>{" "}
          {s.count.toLocaleString()}
        </span>
      ))}
      <span className="text-[var(--color-border)]">|</span>
      <span>{total.toLocaleString()} total</span>
    </div>
  );
}

export function AtlasBrowser() {
  const [search, setSearch] = useState("");
  const [jurisdictionFilter, setJurisdictionFilter] = useState<
    string | undefined
  >(undefined);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [selectedChildren, setSelectedChildren] = useState<Rule[]>([]);
  const [showBrowser, setShowBrowser] = useState(true);

  const { rules, stats, loading, error, hasMore, loadMore } = useRules({
    jurisdiction: jurisdictionFilter,
    search: search || undefined,
  });

  /* v8 ignore start -- async Supabase calls tested via integration/e2e */
  const selectRule = useCallback(async (rule: Rule) => {
    setSelectedRule(rule);
    setShowBrowser(false);

    try {
      const { data: children } = await supabaseArch
        .from("rules")
        .select("*")
        .eq("parent_id", rule.id)
        .order("ordinal");

      setSelectedChildren(children || []);
    } catch (err) {
      console.error("Failed to fetch children:", err);
      setSelectedChildren([]);
    }
  }, []);
  /* v8 ignore stop */

  /* v8 ignore start -- requires async selectRule to complete first */
  const currentDoc = useMemo(
    () =>
      selectedRule
        ? transformRuleToViewerDoc(selectedRule, selectedChildren)
        : null,
    [selectedRule, selectedChildren]
  );

  if (!showBrowser && currentDoc) {
    return (
      <div className="min-h-[calc(100vh-200px)]">
        <DocumentViewer
          document={currentDoc}
          onBack={() => setShowBrowser(true)}
        />
      </div>
    );
  }
  /* v8 ignore stop */

  return (
    <div className="max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="heading-section text-[var(--color-text)] mb-4">Atlas</h1>
        <p className="font-[family-name:var(--f-body)] text-lg text-[var(--color-text-secondary)] max-w-[600px] mx-auto mb-6">
          Browse the legal document archive. Statutes, regulations, and IRS
          guidance across jurisdictions.
        </p>
        <StatsBadge stats={stats} />
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-8 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search statutes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border-subtle)] rounded-lg font-[family-name:var(--f-body)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-precision)] transition-colors"
        />

        <div className="flex gap-2">
          {[
            { label: "All", value: undefined },
            { label: "US", value: "us" },
            { label: "UK", value: "uk" },
            { label: "Canada", value: "canada" },
          ].map((opt) => (
            <button
              key={opt.label}
              className={`px-4 py-2 rounded-lg font-[family-name:var(--f-mono)] text-xs font-medium border transition-colors duration-150 ${
                jurisdictionFilter === opt.value
                  ? "bg-[rgba(59,130,246,0.15)] border-[var(--color-precision)] text-[var(--color-precision)]"
                  : "bg-transparent border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-[var(--color-border)] hover:text-[var(--color-text-secondary)]"
              }`}
              onClick={() => setJurisdictionFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 mb-8 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-lg text-sm text-[#ef4444]">
          {error}
        </div>
      )}

      {/* Rule tree */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden min-h-[400px]">
        {loading && rules.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-[var(--color-text-muted)]">
            Loading rules...
          </div>
        ) : rules.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-[var(--color-text-muted)]">
            No rules found.
          </div>
        ) : (
          <>
            <RuleTree rules={rules} onSelect={selectRule} />
            {hasMore && (
              <div className="flex justify-center py-4 border-t border-[var(--color-border-subtle)]">
                <button
                  className="px-6 py-2 font-[family-name:var(--f-mono)] text-xs text-[var(--color-precision)] bg-transparent border border-[var(--color-border)] rounded-lg hover:bg-[rgba(59,130,246,0.1)] transition-colors"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

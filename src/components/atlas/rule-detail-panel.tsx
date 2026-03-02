"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ViewerDocument } from "@/lib/atlas-utils";
import type { Rule } from "@/lib/supabase";
import { useEncoding } from "@/hooks/use-encoding";
import { SourceTab } from "./source-tab";
import { EncodingTab } from "./encoding-tab";
import { AgentLogsTab } from "./agent-logs-tab";

type TabId = "source" | "encoding" | "agent-logs";

export function RuleDetailPanel({
  document,
  rule,
  onBack,
}: {
  document: ViewerDocument;
  rule: Rule;
  onBack?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("source");
  const { encoding, sessionEvents, loading } = useEncoding(rule.id);

  const getJurisdictionLabel = () => {
    switch (document.jurisdiction) {
      case "canada":
        return "CA";
      case "uk":
        return "UK";
      default:
        if (document.jurisdiction.startsWith("us-")) {
          return document.jurisdiction.replace("us-", "").toUpperCase();
        }
        return "US";
    }
  };

  const tabs: { id: TabId; label: string; hasData: boolean }[] = [
    { id: "source", label: "Source", hasData: true },
    { id: "encoding", label: "Encoding", hasData: !!encoding },
    {
      id: "agent-logs",
      label: "Agent logs",
      hasData: sessionEvents.length > 0,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              className="w-8 h-8 flex items-center justify-center bg-transparent border border-[var(--color-border)] rounded text-[var(--color-text-muted)] cursor-pointer hover:border-[var(--color-precision)] hover:text-[var(--color-precision)] transition-colors"
              onClick={onBack}
              title="Back to browser"
            >
              ←
            </button>
          )}
          <span className="font-mono text-sm text-[var(--color-text)]">
            {document.citation}
          </span>
        </div>

        <span className="font-mono text-xs font-semibold text-[var(--color-precision)]">
          {getJurisdictionLabel()}
        </span>
      </header>

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-6 py-3 font-mono text-xs font-medium border-b-2 transition-colors duration-150 flex items-center gap-2 ${
              activeTab === tab.id
                ? "border-[var(--color-precision)] text-[var(--color-precision)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id !== "source" && tab.hasData && !loading && (
              <span className="w-1.5 h-1.5 bg-[var(--color-precision)] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <main className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "source" && (
              <>
                <h1 className="font-display text-2xl text-[var(--color-text)] mb-8 max-w-[800px] mx-auto">
                  {document.title}
                </h1>
                <SourceTab document={document} />
              </>
            )}
            {activeTab === "encoding" && (
              <EncodingTab encoding={encoding} loading={loading} />
            )}
            {activeTab === "agent-logs" && (
              <AgentLogsTab
                sessionEvents={sessionEvents}
                loading={loading}
                sessionId={encoding?.session_id ?? null}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Status bar */}
      <footer className="flex items-center justify-between px-6 py-2 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span className="w-1.5 h-1.5 bg-[var(--color-success)] rounded-full" />
          <span>Connected to Atlas</span>
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">
          {document.subsections.length} subsections
          {encoding && " | RAC available"}
        </span>
      </footer>
    </div>
  );
}

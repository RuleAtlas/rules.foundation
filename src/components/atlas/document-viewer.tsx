"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Subsection {
  id: string;
  text: string;
}

interface ViewerDocument {
  citation: string;
  title: string;
  subsections: Subsection[];
  hasRac: boolean;
  jurisdiction: string;
  archPath: string | null;
}

type ViewMode = "statute" | "split";

export function DocumentViewer({
  document,
  onBack,
}: {
  document: ViewerDocument;
  onBack?: () => void;
}) {
  const [highlightedSection, setHighlightedSection] = useState<string | null>(
    null
  );
  const [viewMode] = useState<ViewMode>("statute");

  const handleSectionHover = useCallback((sectionId: string | null) => {
    setHighlightedSection(sectionId);
  }, []);

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
          <span className="font-[family-name:var(--f-mono)] text-sm text-[var(--color-text)]">
            Atlas
          </span>
        </div>

        <div className="font-[family-name:var(--f-mono)] text-sm text-[var(--color-text-secondary)]">
          {document.citation}
        </div>

        <span
          className="font-[family-name:var(--f-mono)] text-xs font-semibold text-[var(--color-precision)]"
        >
          {getJurisdictionLabel()}
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {(viewMode === "statute" || viewMode === "split") && (
            <motion.div
              key="statute-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-[800px] mx-auto"
            >
              <h1 className="font-[family-name:var(--f-display)] text-2xl text-[var(--color-text)] mb-8">
                {document.title}
              </h1>

              {document.subsections.map((subsection) => (
                <div
                  key={subsection.id}
                  className={`flex gap-4 p-4 rounded-lg mb-3 transition-colors duration-150 cursor-default ${
                    highlightedSection === subsection.id
                      ? "bg-[rgba(59,130,246,0.08)]"
                      : "hover:bg-[rgba(255,255,255,0.02)]"
                  }`}
                  onMouseEnter={() => handleSectionHover(subsection.id)}
                  onMouseLeave={() => handleSectionHover(null)}
                >
                  <span className="font-[family-name:var(--f-mono)] text-xs text-[var(--color-precision)] pt-1 shrink-0">
                    ({subsection.id})
                  </span>
                  <p className="font-[family-name:var(--f-body)] text-[0.95rem] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {subsection.text}
                  </p>
                </div>
              ))}

              {document.archPath && (
                <div className="mt-8 pt-4 border-t border-[var(--color-border-subtle)]">
                  <span className="font-[family-name:var(--f-mono)] text-xs text-[var(--color-text-muted)]">
                    Source:{" "}
                  </span>
                  <code className="font-[family-name:var(--f-mono)] text-xs text-[var(--color-precision)]">
                    {document.archPath}
                  </code>
                </div>
              )}
            </motion.div>
          )}
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
          {document.hasRac && " | RAC available"}
        </span>
      </footer>
    </div>
  );
}

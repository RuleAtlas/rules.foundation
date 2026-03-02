"use client";

import { useState } from "react";
import type { ViewerDocument } from "@/lib/atlas-utils";

export function SourceTab({ document }: { document: ViewerDocument }) {
  const [highlightedSection, setHighlightedSection] = useState<string | null>(
    null
  );

  return (
    <div className="max-w-[800px] mx-auto">
      {document.subsections.map((subsection) => (
        <div
          key={subsection.id}
          className={`flex gap-4 p-4 rounded-lg mb-3 transition-colors duration-150 cursor-default ${
            highlightedSection === subsection.id
              ? "bg-[rgba(59,130,246,0.08)]"
              : "hover:bg-[rgba(255,255,255,0.02)]"
          }`}
          onMouseEnter={() => setHighlightedSection(subsection.id)}
          onMouseLeave={() => setHighlightedSection(null)}
        >
          <span className="font-mono text-xs text-[var(--color-precision)] pt-1 shrink-0">
            ({subsection.id})
          </span>
          <p className="text-[0.95rem] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
            {subsection.text}
          </p>
        </div>
      ))}

      {document.archPath && (
        <div className="mt-8 pt-4 border-t border-[var(--color-border-subtle)]">
          <span className="font-mono text-xs text-[var(--color-text-muted)]">
            Source:{" "}
          </span>
          <code className="font-mono text-xs text-[var(--color-precision)]">
            {document.archPath}
          </code>
        </div>
      )}
    </div>
  );
}

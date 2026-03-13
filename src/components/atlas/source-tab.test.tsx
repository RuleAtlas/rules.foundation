import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SourceTab } from "./source-tab";
import type { ViewerDocument } from "@/lib/atlas-utils";

const baseDoc: ViewerDocument = {
  citation: "26 USC 24(d)(1)",
  title: "Test section",
  subsections: [
    { id: "A", text: "first subsection text" },
    { id: "B", text: "second subsection text" },
  ],
  hasRac: false,
  jurisdiction: "us",
  archPath: null,
};

describe("SourceTab context rendering", () => {
  it("renders subsections normally when no contextText is present", () => {
    render(<SourceTab document={baseDoc} />);
    expect(screen.getByText("first subsection text")).toBeInTheDocument();
    expect(screen.getByText("second subsection text")).toBeInTheDocument();
    // No context intro block
    expect(
      screen.queryByTestId("context-intro")
    ).not.toBeInTheDocument();
  });

  it("renders context intro block when contextText is provided", () => {
    const doc: ViewerDocument = {
      ...baseDoc,
      contextText: "shall be increased by the lesser of—",
    };
    render(<SourceTab document={doc} />);
    expect(
      screen.getByText("shall be increased by the lesser of—")
    ).toBeInTheDocument();
  });

  it("highlights the matching subsection when highlightedSubsection is set", () => {
    const doc: ViewerDocument = {
      ...baseDoc,
      highlightedSubsection: "A",
    };
    render(<SourceTab document={doc} />);
    // The highlighted subsection container should have a left border accent
    const subsectionA = screen.getByText("first subsection text").closest("[data-subsection-id]");
    expect(subsectionA).toHaveClass("border-l-2");
  });

  it("does not highlight any subsection when highlightedSubsection does not match", () => {
    const doc: ViewerDocument = {
      ...baseDoc,
      highlightedSubsection: "Z",
    };
    render(<SourceTab document={doc} />);
    // Neither subsection should have the highlight border
    const subsectionA = screen.getByText("first subsection text").closest("[data-subsection-id]");
    const subsectionB = screen.getByText("second subsection text").closest("[data-subsection-id]");
    if (subsectionA) expect(subsectionA).not.toHaveClass("border-l-2");
    if (subsectionB) expect(subsectionB).not.toHaveClass("border-l-2");
  });

  it("renders both contextText and highlightedSubsection correctly", () => {
    const doc: ViewerDocument = {
      ...baseDoc,
      contextText: "shall be increased by the lesser of—",
      highlightedSubsection: "A",
    };
    render(<SourceTab document={doc} />);
    // Context text is rendered
    expect(
      screen.getByText("shall be increased by the lesser of—")
    ).toBeInTheDocument();
    // Highlighted subsection has the accent
    const subsectionA = screen.getByText("first subsection text").closest("[data-subsection-id]");
    expect(subsectionA).toHaveClass("border-l-2");
  });
});

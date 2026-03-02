import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { TreeBreadcrumbs } from "./tree-breadcrumbs";

describe("TreeBreadcrumbs", () => {
  it("returns null for empty items", () => {
    const { container } = render(<TreeBreadcrumbs items={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders single item as non-link (current page)", () => {
    render(
      <TreeBreadcrumbs items={[{ label: "Browse", href: "/browse" }]} />
    );
    expect(screen.getByText("Browse")).toBeInTheDocument();
    expect(screen.getByText("Browse").closest("a")).toBeNull();
  });

  it("renders Browse as a link when followed by other items", () => {
    render(
      <TreeBreadcrumbs
        items={[
          { label: "Browse", href: "/browse" },
          { label: "United States", href: "/browse/us" },
        ]}
      />
    );
    const browseLink = screen.getByText("Browse").closest("a");
    expect(browseLink).not.toBeNull();
    expect(browseLink?.getAttribute("href")).toBe("/browse");

    // Last item is not a link
    expect(screen.getByText("United States").closest("a")).toBeNull();
  });

  it("renders separator slashes between items", () => {
    render(
      <TreeBreadcrumbs
        items={[
          { label: "Browse", href: "/browse" },
          { label: "US", href: "/browse/us" },
          { label: "Statutes", href: "/browse/us/statute" },
        ]}
      />
    );
    const slashes = screen.getAllByText("/");
    expect(slashes).toHaveLength(2);
  });

  it("renders full path with last item not linked", () => {
    render(
      <TreeBreadcrumbs
        items={[
          { label: "Browse", href: "/browse" },
          { label: "US", href: "/browse/us" },
          { label: "Title 26", href: "/browse/us/statute/26" },
        ]}
      />
    );
    expect(screen.getByText("Browse").closest("a")).not.toBeNull();
    expect(screen.getByText("US").closest("a")).not.toBeNull();
    expect(screen.getByText("Title 26").closest("a")).toBeNull();
  });
});

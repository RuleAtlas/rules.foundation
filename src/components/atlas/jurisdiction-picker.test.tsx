import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPush = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn() }),
}));

// Mock getJurisdictionCounts
const mockGetJurisdictionCounts = vi.fn();

vi.mock("@/lib/tree-data", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/tree-data")>();
  return {
    ...actual,
    getJurisdictionCounts: (...args: unknown[]) =>
      mockGetJurisdictionCounts(...args),
  };
});

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabaseArch: { from: vi.fn() },
  supabase: { from: vi.fn() },
}));

import { JurisdictionPicker } from "./jurisdiction-picker";
import { COUNTRIES } from "@/lib/tree-data";

describe("JurisdictionPicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("country mode", () => {
    it("shows loading state initially", () => {
      mockGetJurisdictionCounts.mockReturnValue(new Promise(() => {})); // never resolves
      render(<JurisdictionPicker mode="country" />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.getByText("Choose a jurisdiction")).toBeInTheDocument();
    });

    it("renders country cards with counts", async () => {
      const counts = new Map([
        ["us", 50000],
        ["us-oh", 10000],
        ["uk", 1500],
        ["canada", 2000],
      ]);
      mockGetJurisdictionCounts.mockResolvedValue(counts);

      render(<JurisdictionPicker mode="country" />);

      await waitFor(() =>
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
      );

      expect(screen.getByText("United States")).toBeInTheDocument();
      expect(screen.getByText("60,000 rules")).toBeInTheDocument(); // 50000 + 10000
      expect(screen.getByText("United Kingdom")).toBeInTheDocument();
      expect(screen.getByText("1,500 rules")).toBeInTheDocument();
      expect(screen.getByText("Canada")).toBeInTheDocument();
      expect(screen.getByText("2,000 rules")).toBeInTheDocument();
    });

    it("filters out countries with zero rules", async () => {
      const counts = new Map([
        ["us", 50000],
        ["us-oh", 0],
        ["uk", 0],
        ["canada", 0],
      ]);
      mockGetJurisdictionCounts.mockResolvedValue(counts);

      render(<JurisdictionPicker mode="country" />);

      await waitFor(() =>
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
      );

      expect(screen.getByText("United States")).toBeInTheDocument();
      expect(screen.queryByText("United Kingdom")).not.toBeInTheDocument();
      expect(screen.queryByText("Canada")).not.toBeInTheDocument();
    });

    it("shows empty state when all counts are zero", async () => {
      mockGetJurisdictionCounts.mockResolvedValue(new Map());

      render(<JurisdictionPicker mode="country" />);

      await waitFor(() =>
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
      );

      expect(screen.getByText("No jurisdictions found.")).toBeInTheDocument();
    });

    it("navigates on card click", async () => {
      const counts = new Map([
        ["us", 100],
        ["us-oh", 0],
        ["uk", 50],
        ["canada", 0],
      ]);
      mockGetJurisdictionCounts.mockResolvedValue(counts);

      render(<JurisdictionPicker mode="country" />);

      await waitFor(() =>
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
      );

      fireEvent.click(screen.getByText("United States"));
      expect(mockPush).toHaveBeenCalledWith("/atlas/us");
    });

    it("navigates on Enter key", async () => {
      const counts = new Map([["uk", 50]]);
      mockGetJurisdictionCounts.mockResolvedValue(counts);

      render(<JurisdictionPicker mode="country" />);

      await waitFor(() =>
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
      );

      fireEvent.keyDown(screen.getByText("United Kingdom"), {
        key: "Enter",
      });
      expect(mockPush).toHaveBeenCalledWith("/atlas/uk");
    });

    it("navigates on Space key", async () => {
      const counts = new Map([["uk", 50]]);
      mockGetJurisdictionCounts.mockResolvedValue(counts);

      render(<JurisdictionPicker mode="country" />);

      await waitFor(() =>
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
      );

      fireEvent.keyDown(screen.getByText("United Kingdom"), {
        key: " ",
      });
      expect(mockPush).toHaveBeenCalledWith("/atlas/uk");
    });

    it("does not navigate on other keys", async () => {
      const counts = new Map([["uk", 50]]);
      mockGetJurisdictionCounts.mockResolvedValue(counts);

      render(<JurisdictionPicker mode="country" />);

      await waitFor(() =>
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
      );

      fireEvent.keyDown(screen.getByText("United Kingdom"), {
        key: "Tab",
      });
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("sub-jurisdiction mode", () => {
    const usCountry = COUNTRIES.find((c) => c.slug === "us")!;

    it("renders sub-jurisdiction cards with counts", async () => {
      const counts = new Map([
        ["us", 50000],
        ["us-oh", 10000],
      ]);
      mockGetJurisdictionCounts.mockResolvedValue(counts);

      render(
        <JurisdictionPicker mode="sub-jurisdiction" country={usCountry} />
      );

      await waitFor(() =>
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
      );

      expect(
        screen.getByText("Choose a sub-jurisdiction")
      ).toBeInTheDocument();
      expect(screen.getByText("Federal")).toBeInTheDocument();
      expect(screen.getByText("50,000 rules")).toBeInTheDocument();
      expect(screen.getByText("Ohio")).toBeInTheDocument();
      expect(screen.getByText("10,000 rules")).toBeInTheDocument();
    });

    it("navigates to sub-jurisdiction on click", async () => {
      const counts = new Map([
        ["us", 50000],
        ["us-oh", 10000],
      ]);
      mockGetJurisdictionCounts.mockResolvedValue(counts);

      render(
        <JurisdictionPicker mode="sub-jurisdiction" country={usCountry} />
      );

      await waitFor(() =>
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
      );

      fireEvent.click(screen.getByText("Ohio"));
      expect(mockPush).toHaveBeenCalledWith("/atlas/us/oh");
    });
  });
});

"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { TreeNode, TreeResult, BreadcrumbItem } from "@/lib/tree-data";
import {
  getJurisdictionNodes,
  getDocTypeNodes,
  getTitleNodes,
  getSectionNodes,
  getActNodes,
  getChildrenByParentId,
  getRuleById,
  buildBreadcrumbs,
  getJurisdiction,
  isUUID,
} from "@/lib/tree-data";
import type { Rule } from "@/lib/supabase";

interface CacheEntry {
  nodes: TreeNode[];
  hasMore: boolean;
}

export function useTreeNodes(segments: string[]) {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [leafRule, setLeafRule] = useState<Rule | null>(null);

  const cache = useRef<Map<string, CacheEntry>>(new Map());

  const segmentsKey = segments.join("/");

  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => buildBreadcrumbs(segments),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [segmentsKey]
  );

  useEffect(() => {
    const cached = cache.current.get(segmentsKey);
    if (cached) {
      setNodes(cached.nodes);
      setHasMore(cached.hasMore);
      setLoading(false);
      setLeafRule(null);
      setError(null);
      setPage(0);
      return;
    }

    fetchNodes(segments, 0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentsKey]);

  /* v8 ignore start -- async Supabase-dependent fetch logic */
  async function fetchNodes(
    segs: string[],
    pageNum: number,
    append: boolean
  ) {
    setLoading(true);
    setError(null);
    setLeafRule(null);

    try {
      let result: { nodes: TreeNode[]; hasMore: boolean };

      if (segs.length === 0) {
        const fetched = await getJurisdictionNodes();
        result = { nodes: fetched, hasMore: false };
      } else if (segs.length === 1) {
        const jur = getJurisdiction(segs[0]);
        if (jur && jur.hasCitationPaths) {
          const fetched = await getDocTypeNodes(segs[0]);
          result = { nodes: fetched, hasMore: false };
        } else {
          const r: TreeResult = await getActNodes(segs[0], pageNum);
          result = { nodes: r.nodes, hasMore: r.hasMore };
        }
      } else {
        const jur = getJurisdiction(segs[0]);
        if (jur && jur.hasCitationPaths) {
          if (segs.length === 2) {
            const fetched = await getTitleNodes(segs[0], segs[1]);
            result = { nodes: fetched, hasMore: false };
          } else {
            const pathPrefix = segs.join("/");
            const r: TreeResult = await getSectionNodes(pathPrefix, pageNum);
            result = { nodes: r.nodes, hasMore: r.hasMore };
          }
        } else {
          const lastSegment = segs[segs.length - 1];
          if (isUUID(lastSegment)) {
            const r: TreeResult = await getChildrenByParentId(
              lastSegment,
              pageNum
            );
            if (r.nodes.length === 0) {
              const rule = await getRuleById(lastSegment);
              setLeafRule(rule);
              result = { nodes: [], hasMore: false };
            } else {
              result = { nodes: r.nodes, hasMore: r.hasMore };
            }
          } else {
            result = { nodes: [], hasMore: false };
          }
        }
      }

      if (append) {
        setNodes((prev) => [...prev, ...result.nodes]);
      } else {
        setNodes(result.nodes);
      }
      setHasMore(result.hasMore);
      setPage(pageNum);

      if (!append) {
        cache.current.set(segs.join("/"), {
          nodes: result.nodes,
          hasMore: result.hasMore,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }
  /* v8 ignore stop */

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNodes(segments, page + 1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasMore, segmentsKey, page]);

  return { nodes, loading, error, hasMore, loadMore, breadcrumbs, leafRule };
}

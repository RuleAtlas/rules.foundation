"use client";

import { useState, useEffect } from "react";
import {
  getRuleEncoding,
  getSDKSessionEvents,
  type RuleEncodingData,
  type SDKSessionEvent,
} from "@/lib/supabase";

export interface UseEncodingResult {
  encoding: RuleEncodingData | null;
  sessionEvents: SDKSessionEvent[];
  loading: boolean;
  error: string | null;
}

export function useEncoding(ruleId: string | null): UseEncodingResult {
  const [encoding, setEncoding] = useState<RuleEncodingData | null>(null);
  const [sessionEvents, setSessionEvents] = useState<SDKSessionEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ruleId) {
      setEncoding(null);
      setSessionEvents([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const encodingData = await getRuleEncoding(ruleId!);
        if (cancelled) return;
        setEncoding(encodingData);

        if (encodingData?.session_id) {
          const events = await getSDKSessionEvents(encodingData.session_id);
          if (cancelled) return;
          setSessionEvents(events);
        } else {
          setSessionEvents([]);
        }
      } catch (err) {
        if (cancelled) return;
        setError("Failed to load encoding data");
        setEncoding(null);
        setSessionEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [ruleId]);

  return { encoding, sessionEvents, loading, error };
}

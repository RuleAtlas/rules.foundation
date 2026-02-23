"use client";

import { use } from "react";
import { RuleViewer } from "./rule-viewer";

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

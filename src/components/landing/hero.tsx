"use client";

import { useState, useEffect } from "react";
import { ArrowRightIcon } from "@/components/icons";
import CodeBlock from "@/components/code-block";
import { heroRacCode } from "@/lib/rac-examples";

function HeroTransform() {
  const [phase, setPhase] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleClick = () => {
    setIsPaused(true);
    setPhase((p) => (p + 1) % 3);
  };

  const statuteText = `(a) In general.\u2014 There is hereby
imposed a tax equal to 3.8 percent
of the lesser of net investment
income or modified AGI in excess
of the threshold amount.`;

  return (
    <div
      className="flex items-center md:items-stretch justify-center gap-8 flex-wrap md:flex-row flex-col cursor-pointer"
      onClick={handleClick}
      title="Click to advance"
    >
      {/* Statute panel */}
      <div
        className={`flex-[0_0_380px] max-md:flex-[1_1_100%] max-md:max-w-full bg-[var(--color-code-bg)] border rounded-md overflow-hidden transition-all duration-500 flex flex-col ${
          phase === 0
            ? "opacity-100 scale-100 border-[var(--color-accent)] shadow-[0_0_30px_rgba(180,83,9,0.12)]"
            : "opacity-60 scale-[0.98] border-[#2a2826]"
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2a2826]">
          <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full" />
          <span className="font-mono text-xs text-[var(--color-code-text)]">
            26 USC &sect; 1411(a)
          </span>
        </div>
        <div className="p-6 font-mono text-[0.85rem] text-[var(--color-code-text)] leading-relaxed whitespace-pre-wrap flex-1">
          {statuteText}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex flex-col items-center gap-2 max-md:rotate-90 max-md:my-4">
        <div
          className={`w-16 h-0.5 relative transition-colors duration-200 after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:border-[5px] after:border-transparent after:border-l-current after:bg-transparent ${
            phase === 1
              ? "bg-[var(--color-accent)] after:border-l-[var(--color-accent)]"
              : "bg-[var(--color-rule)] after:border-l-[var(--color-rule)]"
          }`}
        />
        <span
          className={`font-mono text-[0.7rem] uppercase tracking-[0.12em] transition-colors duration-200 ${
            phase === 1
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-ink-muted)]"
          }`}
        >
          AutoRAC
        </span>
      </div>

      {/* RAC panel */}
      <div
        className={`flex-[0_0_380px] max-md:flex-[1_1_100%] max-md:max-w-full bg-[var(--color-code-bg)] border rounded-md overflow-hidden transition-all duration-500 flex flex-col ${
          phase === 2
            ? "opacity-100 scale-100 border-[var(--color-accent)] shadow-[0_0_30px_rgba(180,83,9,0.12)]"
            : "opacity-60 scale-[0.98] border-[#2a2826]"
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2a2826]">
          <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full" />
          <span className="font-mono text-xs text-[var(--color-code-text)]">
            statute/26/1411/a.rac
          </span>
        </div>
        <CodeBlock
          code={heroRacCode}
          language="rac"
          className="p-6 font-mono text-[0.85rem] leading-relaxed whitespace-pre-wrap m-0 flex-1"
        />
      </div>
    </div>
  );
}

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative z-1 min-h-screen flex items-center justify-center py-24 px-8">
      <div
        className={`max-w-[1100px] transition-all duration-800 ${
          mounted
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <div className="text-center mb-14">
          <h1 className="heading-page mb-6">
            Encoding the{" "}
            <span className="text-[var(--color-accent)]">
              world&apos;s rules
            </span>
          </h1>

          <p className="font-body text-lg text-[var(--color-ink-secondary)] leading-relaxed max-w-[540px] mx-auto">
            Axiom builds open, machine-readable encodings of
            statutes, regulations, and policy rules. Ground truth for AI systems.
          </p>
        </div>

        <HeroTransform />

        <div className="flex gap-6 justify-center mt-14 flex-wrap">
          <a href="/atlas" className="btn-primary">
            Explore the atlas
            <ArrowRightIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

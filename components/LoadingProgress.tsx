"use client";

import { useEffect, useState } from "react";
import { t, type Locale } from "@/lib/i18n";

interface LoadingProgressProps {
  active: boolean;
  locale: Locale;
}

export default function LoadingProgress({ active, locale }: LoadingProgressProps) {
  const [stageIdx, setStageIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const STAGES = [
    { key: "loadingStage1", icon: "🖼️", duration: 800 },
    { key: "loadingStage2", icon: "🔬", duration: 3000 },
    { key: "loadingStage3", icon: "💊", duration: 1200 },
    { key: "loadingStage4", icon: "✨", duration: 500 },
  ] as const;

  const TIP_KEYS = [
    "loadingTip1", "loadingTip2", "loadingTip3", "loadingTip4",
    "loadingTip5", "loadingTip6", "loadingTip7", "loadingTip8",
  ] as const;

  useEffect(() => {
    if (!active) {
      setStageIdx(0);
      setElapsed(0);
      return;
    }

    let cumulative = 0;
    const stageTimers: NodeJS.Timeout[] = [];
    STAGES.forEach((stage, i) => {
      cumulative += stage.duration;
      stageTimers.push(setTimeout(() => setStageIdx(Math.min(i + 1, STAGES.length - 1)), cumulative));
    });

    const tipTimer = setInterval(() => {
      setTipIdx((i) => (i + 1) % TIP_KEYS.length);
    }, 3000);

    const elapsedTimer = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);

    return () => {
      stageTimers.forEach(clearTimeout);
      clearInterval(tipTimer);
      clearInterval(elapsedTimer);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="card p-6 my-4 result-section">
      <div className="flex justify-center mb-5">
        <div className="relative">
          <div className="text-6xl animate-bounce">💊</div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent)] rounded-full animate-ping" />
        </div>
      </div>

      <div className="text-center mb-5">
        <div className="text-lg font-semibold text-[var(--text-primary)] mb-1">
          {STAGES[stageIdx].icon} {t(locale, STAGES[stageIdx].key as any)}
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          {t(locale, "loadingElapsed", { n: elapsed })}
        </div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between mb-2">
          {STAGES.map((stage, i) => (
            <div
              key={i}
              className={`flex flex-col items-center transition-all ${
                i <= stageIdx ? "opacity-100" : "opacity-30"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  i < stageIdx
                    ? "bg-[var(--accent)] text-white"
                    : i === stageIdx
                    ? "bg-[var(--accent)] text-white ring-4 ring-[var(--accent-light)] animate-pulse"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {i < stageIdx ? "✓" : stage.icon}
              </div>
              <span className="text-[10px] mt-1 text-[var(--text-muted)] hidden sm:block">
                {t(locale, stage.key as any)}
              </span>
            </div>
          ))}
        </div>

        <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden mt-2">
          <div
            className="absolute h-full bg-gradient-to-r from-[var(--accent)] to-[#9bb8b0] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${((stageIdx + 1) / STAGES.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-[var(--accent-light)] rounded-xl p-3 text-center min-h-[3rem] flex items-center justify-center">
        <p
          key={tipIdx}
          className="text-sm text-[var(--accent)] font-medium animate-[fadeIn_0.5s_ease]"
        >
          {t(locale, TIP_KEYS[tipIdx] as any)}
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: "70%" }} />
        <div className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: "90%" }} />
        <div className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: "60%" }} />
      </div>
    </div>
  );
}

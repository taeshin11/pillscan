"use client";

import { useEffect, useState } from "react";

const TIPS = [
  "💡 알약을 봉지에서 꺼내서 찍으면 더 정확해요",
  "💡 글씨가 잘 보이는 면을 가까이 찍어보세요",
  "💡 앞면과 뒷면 모두 찍으면 식별률이 올라가요",
  "💡 밝은 곳에서 단색 배경으로 찍으세요",
  "💊 25,409개의 한국 약품 데이터베이스를 검색 중",
  "🌍 14,900개의 해외 약품 데이터도 확인 중",
  "🔬 AI가 모양·색상·각인을 분석하고 있어요",
  "📸 이미지 대비와 선명도를 자동 보정 중",
];

const STAGES = [
  { label: "이미지 전처리", icon: "🖼️", duration: 800 },
  { label: "AI 시각 분석", icon: "🔬", duration: 3000 },
  { label: "약품 DB 검색", icon: "💊", duration: 1200 },
  { label: "결과 정리", icon: "✨", duration: 500 },
];

interface LoadingProgressProps {
  active: boolean;
}

export default function LoadingProgress({ active }: LoadingProgressProps) {
  const [stageIdx, setStageIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) {
      setStageIdx(0);
      setElapsed(0);
      return;
    }

    // Cycle through stages
    let cumulative = 0;
    const stageTimers: NodeJS.Timeout[] = [];
    STAGES.forEach((stage, i) => {
      cumulative += stage.duration;
      stageTimers.push(setTimeout(() => setStageIdx(Math.min(i + 1, STAGES.length - 1)), cumulative));
    });

    // Cycle through tips every 3s
    const tipTimer = setInterval(() => {
      setTipIdx((i) => (i + 1) % TIPS.length);
    }, 3000);

    // Elapsed counter
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
      {/* Animated pill icon */}
      <div className="flex justify-center mb-5">
        <div className="relative">
          <div className="text-6xl animate-bounce">💊</div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent)] rounded-full animate-ping" />
        </div>
      </div>

      {/* Current stage */}
      <div className="text-center mb-5">
        <div className="text-lg font-semibold text-[var(--text-primary)] mb-1">
          {STAGES[stageIdx].icon} {STAGES[stageIdx].label}
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          {elapsed}초 경과
        </div>
      </div>

      {/* Progress bar with stages */}
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
                {stage.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress line */}
        <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden mt-2">
          <div
            className="absolute h-full bg-gradient-to-r from-[var(--accent)] to-[#9bb8b0] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${((stageIdx + 1) / STAGES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Rotating tip */}
      <div className="bg-[var(--accent-light)] rounded-xl p-3 text-center min-h-[3rem] flex items-center justify-center">
        <p
          key={tipIdx}
          className="text-sm text-[var(--accent)] font-medium animate-[fadeIn_0.5s_ease]"
        >
          {TIPS[tipIdx]}
        </p>
      </div>

      {/* Skeleton preview of result */}
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: "70%" }} />
        <div className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: "90%" }} />
        <div className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: "60%" }} />
      </div>
    </div>
  );
}

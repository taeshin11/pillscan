"use client";

import { useState } from "react";
import type { Locale } from "@/lib/translations";

interface ResultCardProps {
  result: any;
  locale: Locale;
  t: Record<string, string>;
  onReset: () => void;
}

export default function ResultCard({ result, t, onReset }: ResultCardProps) {
  const { analysis, matchedDrugs } = result;
  const [contributed, setContributed] = useState(false);
  const [showContribute, setShowContribute] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const handleContribute = async () => {
    try {
      await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drugName: analysis.drugName,
          shape: analysis.shape,
          color: analysis.color,
          imprint: analysis.imprint,
          confidence: analysis.confidence,
        }),
      });
    } finally {
      setContributed(true);
      setShowContribute(false);
    }
  };

  const drug = matchedDrugs?.[activeTab];
  const confidenceColor =
    analysis.confidence >= 80 ? "text-green-600" :
    analysis.confidence >= 50 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="result-section space-y-4">
      {/* AI Analysis summary */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{analysis.drugName}</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{analysis.description}</p>
          </div>
          <div className={`text-right shrink-0`}>
            <div className={`text-2xl font-bold ${confidenceColor}`}>{analysis.confidence}%</div>
            <div className="text-xs text-[var(--text-muted)]">{t.confidence}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            ◇ {analysis.shape}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
            ● {analysis.color}
          </span>
          {analysis.imprint && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 font-mono">
              [{analysis.imprint}]
            </span>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {t.geminiAnalysis}
          </span>
        </div>
      </div>

      {/* Drug DB results */}
      {matchedDrugs && matchedDrugs.length > 0 ? (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">{t.resultTitle}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent)] font-medium">
              {t.koreanDB}
            </span>
          </div>

          {/* Tab selector when multiple results */}
          {matchedDrugs.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {matchedDrugs.map((d: any, i: number) => (
                <button
                  key={d.itemSeq}
                  onClick={() => setActiveTab(i)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === i
                      ? "bg-[var(--accent)] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}. {d.itemName?.slice(0, 12)}
                </button>
              ))}
            </div>
          )}

          {drug && (
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">
                  {t.drugName}
                </div>
                <div className="font-medium">{drug.itemName}</div>
                <div className="text-sm text-[var(--text-muted)]">{drug.entpName}</div>
              </div>

              {drug.efcyQesitm && (
                <InfoRow label={t.efficacy} value={drug.efcyQesitm} />
              )}
              {drug.useMethodQesitm && (
                <InfoRow label={t.dosage} value={drug.useMethodQesitm} />
              )}
              {drug.atpnWarnQesitm && (
                <InfoRow label={t.precautions} value={drug.atpnWarnQesitm} highlight="warning" />
              )}
              {drug.atpnQesitm && (
                <InfoRow label={t.precautions} value={drug.atpnQesitm} />
              )}
              {drug.seQesitm && (
                <InfoRow label={t.sideEffects} value={drug.seQesitm} />
              )}
              {drug.intrcQesitm && (
                <InfoRow label={t.interactions} value={drug.intrcQesitm} />
              )}
              {drug.depositMethodQesitm && (
                <InfoRow label={t.storage} value={drug.depositMethodQesitm} />
              )}
              {drug.itemImage && (
                <div>
                  <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">
                    이미지
                  </div>
                  <img
                    src={drug.itemImage}
                    alt={drug.itemName}
                    className="h-16 rounded-lg object-contain border border-[var(--border)]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="card p-5 text-center text-[var(--text-muted)]">
          <div className="text-2xl mb-2">🔍</div>
          <p className="text-sm">{t.noResult}</p>
          <p className="text-xs mt-1 text-[var(--text-muted)]">
            AI 분석 결과를 참고하세요.
          </p>
        </div>
      )}

      {/* Data contribution */}
      {showContribute && !contributed && (
        <div className="card p-4">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-1">{t.contributeTitle}</p>
          <p className="text-xs text-[var(--text-muted)] mb-3">{t.contributeText}</p>
          <div className="flex gap-2">
            <button
              onClick={handleContribute}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--accent)] text-white hover:bg-[#6a8880] transition-colors"
            >
              {t.contributeYes}
            </button>
            <button
              onClick={() => setShowContribute(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border)] hover:bg-gray-50 transition-colors"
            >
              {t.contributeNo}
            </button>
          </div>
        </div>
      )}
      {contributed && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center">
          ✓ 기여해 주셔서 감사합니다!
        </div>
      )}

      {/* Try again */}
      <button
        onClick={onReset}
        className="w-full py-3 rounded-xl text-sm font-medium border border-[var(--border)] hover:bg-gray-50 transition-colors"
      >
        🔄 {t.tryAgain}
      </button>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "warning";
}) {
  const [expanded, setExpanded] = useState(false);
  const MAX_LEN = 200;
  const isLong = value.length > MAX_LEN;

  return (
    <div className={`p-3 rounded-xl ${highlight === "warning" ? "bg-orange-50 border border-orange-100" : "bg-gray-50"}`}>
      <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">
        {highlight === "warning" && "⚠️ "}{label}
      </div>
      <p className="text-sm text-[var(--text-primary)] leading-relaxed">
        {expanded || !isLong ? value : value.slice(0, MAX_LEN) + "..."}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-[var(--accent)] mt-1 hover:underline"
        >
          {expanded ? "접기" : "더 보기"}
        </button>
      )}
    </div>
  );
}

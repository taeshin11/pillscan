"use client";

import { useState } from "react";
import type { Locale } from "@/lib/translations";

interface ResultCardProps {
  result: any;
  locale: Locale;
  t: Record<string, string>;
  onReset: () => void;
  onAddPhoto?: () => void;
}

export default function ResultCard({ result, t, onReset, onAddPhoto }: ResultCardProps) {
  const { pills, count } = result;
  const [activePill, setActivePill] = useState(0);
  const [contributed, setContributed] = useState(false);
  const [showContribute, setShowContribute] = useState(true);

  const current = pills?.[activePill];
  if (!current) return null;

  const { analysis, attrMatches, nameMatches, globalMatches, searchMethod, needsClearerPhoto } = current;

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

  const confidenceColor =
    analysis.confidence >= 80 ? "text-green-600" :
    analysis.confidence >= 50 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="result-section space-y-4">

      {/* Multi-pill selector */}
      {count > 1 && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
            💊 {count}종류 알약 감지됨 (총 {pills.reduce((s: number, p: any) => s + (p.analysis.count || 1), 0)}개)
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pills.map((p: any, i: number) => {
              const a = p.analysis;
              const topMatch = p.attrMatches?.[0]?.itemName;
              const label = topMatch
                ? topMatch.slice(0, 10)
                : a.drugName !== "Unknown"
                  ? a.drugName
                  : [a.color, a.shape].filter(Boolean).join(" ") || `알약 ${i+1}`;
              return (
                <button
                  key={i}
                  onClick={() => setActivePill(i)}
                  className={`shrink-0 flex flex-col items-center px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
                    activePill === i
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-white text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--accent)]"
                  }`}
                >
                  <span className="font-bold">#{i + 1}</span>
                  <span className="mt-0.5 max-w-[100px] truncate">{label}</span>
                  {a.count > 1 && <span className="text-[10px] opacity-70">×{a.count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PRIMARY ANSWER — most likely match */}
      {(() => {
        // Pick the single most-likely answer:
        // 1. Top attribute match if exists
        // 2. Else Gemini's name guess
        const topMatch = current.attrMatches?.[0];
        const primaryName = topMatch?.itemName || (analysis.drugName !== "Unknown" ? analysis.drugName : "미식별");
        const primaryEntp = topMatch?.entpName || analysis.manufacturer || "";
        const primaryImage = topMatch?.itemImage;

        // Confidence: prefer DB match (higher signal), fall back to Gemini
        const primaryConfidence = topMatch
          ? Math.max(70, analysis.confidence)
          : analysis.confidence;
        const primaryConfColor =
          primaryConfidence >= 80 ? "text-green-600" :
          primaryConfidence >= 60 ? "text-yellow-600" : "text-red-600";

        return (
          <div className="card p-5 border-2 border-[var(--accent)] bg-gradient-to-br from-[var(--accent-light)] to-white">
            {count > 1 && (
              <span className="text-xs font-semibold text-[var(--accent)] mb-1 block">알약 #{activePill + 1}</span>
            )}
            <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-2">
              ⭐ 가장 가능성 높은 약
            </div>
            <div className="flex items-start gap-4 mb-3">
              {primaryImage && (
                <img
                  src={primaryImage}
                  alt={primaryName}
                  className="w-20 h-20 rounded-xl object-contain bg-white border border-[var(--border)] shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-[var(--text-primary)] leading-tight">{primaryName}</h2>
                {primaryEntp && (
                  <p className="text-sm text-[var(--text-muted)] mt-1">{primaryEntp}</p>
                )}
                {topMatch?.className && (
                  <p className="text-xs text-[var(--text-muted)]">{topMatch.className}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className={`text-3xl font-bold ${primaryConfColor}`}>{primaryConfidence}%</div>
                <div className="text-[10px] text-[var(--text-muted)]">{t.confidence}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--border)]">
              {(topMatch?.shape || analysis.shape) && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  ◇ {topMatch?.shape || analysis.shape}
                </span>
              )}
              {(topMatch?.color1 || analysis.color) && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                  ● {topMatch?.color1 || analysis.color}{topMatch?.color2 ? `/${topMatch.color2}` : ""}
                </span>
              )}
              {(topMatch?.markFront || analysis.imprint) && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 font-mono">
                  [{topMatch?.markFront || analysis.imprint}]
                </span>
              )}
              {topMatch?.markBack && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 font-mono">
                  뒷면: {topMatch.markBack}
                </span>
              )}
            </div>

            {analysis.drugName !== "Unknown" && topMatch && analysis.drugName !== topMatch.itemName && (
              <p className="text-[10px] text-[var(--text-muted)] mt-3 italic">
                AI 추측: "{analysis.drugName}" — DB 매칭 결과를 우선 표시합니다
              </p>
            )}
          </div>
        );
      })()}

      {/* ⚠️ Clearer photo needed — show when ANY pill is low confidence or has no imprint */}
      {(needsClearerPhoto || analysis.drugName === "Unknown" || analysis.confidence < 80 || !analysis.imprint) && (
        <div className="card p-4 border-l-4 border-yellow-400 bg-yellow-50">
          <p className="text-sm font-semibold text-yellow-800 mb-1">
            📸 더 정확한 결과를 원하시면
          </p>
          <ul className="text-xs text-yellow-700 mb-3 space-y-1 list-none">
            <li>• 알약을 봉지에서 <strong>꺼내서</strong> 촬영해주세요</li>
            <li>• 글씨/각인이 보이는 면을 <strong>최대한 가까이</strong> 찍어주세요</li>
            <li>• <strong>앞면과 뒷면</strong> 각각 촬영하면 더 정확해요</li>
          </ul>
          {onAddPhoto && (
            <button
              onClick={onAddPhoto}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
            >
              📷 다시 촬영하기
            </button>
          )}
        </div>
      )}

      {/* DB Results */}
      <DbResults
        key={activePill}
        attrMatches={attrMatches}
        nameMatches={nameMatches}
        globalMatches={globalMatches}
        searchMethod={searchMethod}
        t={t}
      />

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

      <button
        onClick={onReset}
        className="w-full py-3 rounded-xl text-sm font-medium border border-[var(--border)] hover:bg-gray-50 transition-colors"
      >
        🔄 {t.tryAgain}
      </button>
    </div>
  );
}

// ── DB Results section ───────────────────────────────────────────
function DbResults({
  attrMatches, nameMatches, globalMatches, searchMethod, t,
}: {
  attrMatches: any[];
  nameMatches: any[];
  globalMatches: any[];
  searchMethod: string;
  t: Record<string, string>;
}) {
  const [activeTab, setActiveTab] = useState(0);

  // Attribute-based results (pill_identification.json → enriched with detail)
  if (searchMethod === "attributes" && attrMatches.length > 0) {
    const current = attrMatches[activeTab];
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--text-primary)]">{t.resultTitle}</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent)] font-medium">
            모양·각인 검색
          </span>
        </div>

        {attrMatches.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {attrMatches.map((m: any, i: number) => (
              <button
                key={m.itemSeq || i}
                onClick={() => setActiveTab(i)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === i
                    ? "bg-[var(--accent)] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {m.itemName?.slice(0, 14)}
              </button>
            ))}
          </div>
        )}

        {current && (
          <div className="space-y-3">
            {/* Pill ID attributes */}
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-gray-50">
              {current.shape && <span className="text-xs text-gray-600">◇ {current.shape}</span>}
              {current.color1 && <span className="text-xs text-gray-600">● {current.color1}{current.color2 ? `/${current.color2}` : ""}</span>}
              {current.markFront && <span className="text-xs font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded">{current.markFront}</span>}
              {current.markBack  && <span className="text-xs font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded">{current.markBack}</span>}
            </div>

            <div>
              <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">{t.drugName}</div>
              <div className="font-medium">{current.itemName}</div>
              <div className="text-sm text-[var(--text-muted)]">{current.entpName}</div>
              {current.className && <div className="text-xs text-[var(--text-muted)]">{current.className}</div>}
            </div>

            {current.itemImage && (
              <img
                src={current.itemImage}
                alt={current.itemName}
                className="h-16 rounded-lg object-contain border border-[var(--border)]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}

            {/* Detail from e약은요 DB if matched */}
            {current.detail && <>
              {current.detail.efcyQesitm    && <InfoRow label={t.efficacy}      value={current.detail.efcyQesitm} />}
              {current.detail.useMethodQesitm && <InfoRow label={t.dosage}      value={current.detail.useMethodQesitm} />}
              {current.detail.atpnWarnQesitm  && <InfoRow label={t.precautions} value={current.detail.atpnWarnQesitm} highlight="warning" />}
              {current.detail.atpnQesitm      && <InfoRow label={t.precautions} value={current.detail.atpnQesitm} />}
              {current.detail.seQesitm        && <InfoRow label={t.sideEffects} value={current.detail.seQesitm} />}
              {current.detail.intrcQesitm     && <InfoRow label={t.interactions} value={current.detail.intrcQesitm} />}
              {current.detail.depositMethodQesitm && <InfoRow label={t.storage} value={current.detail.depositMethodQesitm} />}
            </>}
          </div>
        )}
      </div>
    );
  }

  // Name-based Korean results
  if (searchMethod === "name" && nameMatches.length > 0) {
    const drug = nameMatches[activeTab];
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{t.resultTitle}</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent)] font-medium">{t.koreanDB}</span>
        </div>
        {nameMatches.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {nameMatches.map((d: any, i: number) => (
              <button key={d.itemSeq} onClick={() => setActiveTab(i)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === i ? "bg-[var(--accent)] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {d.itemName?.slice(0, 14)}
              </button>
            ))}
          </div>
        )}
        {drug && (
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">{t.drugName}</div>
              <div className="font-medium">{drug.itemName}</div>
              <div className="text-sm text-[var(--text-muted)]">{drug.entpName}</div>
            </div>
            {drug.efcyQesitm      && <InfoRow label={t.efficacy}      value={drug.efcyQesitm} />}
            {drug.useMethodQesitm && <InfoRow label={t.dosage}        value={drug.useMethodQesitm} />}
            {drug.atpnWarnQesitm  && <InfoRow label={t.precautions}   value={drug.atpnWarnQesitm} highlight="warning" />}
            {drug.atpnQesitm      && <InfoRow label={t.precautions}   value={drug.atpnQesitm} />}
            {drug.seQesitm        && <InfoRow label={t.sideEffects}   value={drug.seQesitm} />}
            {drug.intrcQesitm     && <InfoRow label={t.interactions}  value={drug.intrcQesitm} />}
            {drug.depositMethodQesitm && <InfoRow label={t.storage}   value={drug.depositMethodQesitm} />}
            {drug.itemImage && (
              <img src={drug.itemImage} alt={drug.itemName}
                className="h-16 rounded-lg object-contain border border-[var(--border)]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
          </div>
        )}
      </div>
    );
  }

  // Global fallback
  if (searchMethod === "global" && globalMatches.length > 0) {
    const g = globalMatches[0];
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{t.resultTitle}</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">{t.globalDB}</span>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">{t.drugName}</div>
            <div className="font-medium">{g.itemName}</div>
            {g.genericName && <div className="text-sm text-[var(--text-muted)]">{g.genericName}</div>}
            <div className="text-sm text-[var(--text-muted)]">{g.manufacturer}</div>
          </div>
          {g.indications   && <InfoRow label={t.efficacy}    value={g.indications} />}
          {g.dosage        && <InfoRow label={t.dosage}      value={g.dosage} />}
          {g.warnings      && <InfoRow label={t.precautions} value={g.warnings} highlight="warning" />}
          {g.sideEffects   && <InfoRow label={t.sideEffects} value={g.sideEffects} />}
        </div>
      </div>
    );
  }

  // No match
  return (
    <div className="card p-5 text-center text-[var(--text-muted)]">
      <div className="text-2xl mb-2">🔍</div>
      <p className="text-sm">{t.noResult}</p>
      <p className="text-xs mt-1">글씨가 잘 보이는 면을 다시 촬영해 보세요.</p>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: "warning" }) {
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
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-[var(--accent)] mt-1 hover:underline">
          {expanded ? "접기" : "더 보기"}
        </button>
      )}
    </div>
  );
}

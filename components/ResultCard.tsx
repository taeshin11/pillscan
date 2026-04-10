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
            💊 {count}종류 알약 감지됨
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
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Analysis */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {count > 1 && (
              <span className="text-xs font-semibold text-[var(--accent)] mb-1 block">알약 #{activePill + 1}</span>
            )}
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {analysis.drugName !== "Unknown"
                ? analysis.drugName
                : current.attrMatches?.[0]?.itemName || [analysis.color, analysis.shape].filter(Boolean).join(" ") || "미식별"}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{analysis.description}</p>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-2xl font-bold ${confidenceColor}`}>{analysis.confidence}%</div>
            <div className="text-xs text-[var(--text-muted)]">{t.confidence}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {analysis.shape && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              ◇ {analysis.shape}
            </span>
          )}
          {analysis.color && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
              ● {analysis.color}
            </span>
          )}
          {analysis.imprint ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 font-mono">
              [{analysis.imprint}]
            </span>
          ) : analysis.imprintUnclear ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
              각인 식별 불가
            </span>
          ) : null}
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 text-[10px]">
            {searchMethod === "attributes" ? "모양·색상·각인 검색" : searchMethod === "name" ? "이름 검색" : "글로벌 DB"}
          </span>
        </div>
      </div>

      {/* ⚠️ Clearer photo needed */}
      {needsClearerPhoto && (
        <div className="card p-4 border-l-4 border-yellow-400 bg-yellow-50">
          <p className="text-sm font-semibold text-yellow-800 mb-1">
            📸 글씨가 잘 보이는 면을 추가로 찍어주세요
          </p>
          <p className="text-xs text-yellow-700 mb-3">
            알약에 각인/인쇄된 글씨가 보이지만 선명하게 읽히지 않아요.
            글씨가 잘 보이는 면을 정면에서, 밝은 곳에서 촬영하면 더 정확하게 식별할 수 있어요.
          </p>
          {onAddPhoto && (
            <button
              onClick={onAddPhoto}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
            >
              📷 다른 면 촬영하기
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

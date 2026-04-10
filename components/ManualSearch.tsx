"use client";

import { useState } from "react";
import { saveToHistory } from "@/lib/history";

const SHAPES = [
  { value: "원형", icon: "○", label: "원형" },
  { value: "타원형", icon: "⬭", label: "타원형" },
  { value: "반원형", icon: "◗", label: "반원형" },
  { value: "삼각형", icon: "△", label: "삼각형" },
  { value: "사각형", icon: "□", label: "사각형" },
  { value: "마름모형", icon: "◇", label: "마름모형" },
  { value: "장방형", icon: "▭", label: "장방형" },
  { value: "오각형", icon: "⬠", label: "오각형" },
  { value: "육각형", icon: "⬡", label: "육각형" },
  { value: "팔각형", icon: "⯃", label: "팔각형" },
  { value: "기타", icon: "…", label: "기타" },
];

const COLORS = [
  { value: "하양", hex: "#ffffff", border: true },
  { value: "노랑", hex: "#FFD700" },
  { value: "주황", hex: "#FF8C00" },
  { value: "분홍", hex: "#FF69B4" },
  { value: "빨강", hex: "#DC143C" },
  { value: "갈색", hex: "#8B4513" },
  { value: "연두", hex: "#9ACD32" },
  { value: "초록", hex: "#228B22" },
  { value: "청록", hex: "#008B8B" },
  { value: "파랑", hex: "#2563EB" },
  { value: "남색", hex: "#191970" },
  { value: "자주", hex: "#800080" },
  { value: "보라", hex: "#9370DB" },
  { value: "회색", hex: "#A9A9A9" },
  { value: "검정", hex: "#1a1a1a" },
  { value: "투명", hex: "#f0f0f0", border: true, pattern: true },
];

const FORMS = [
  { value: "", label: "전체" },
  { value: "정제", label: "정제류", icon: "💊" },
  { value: "경질캡슐", label: "경질캡슐", icon: "💠" },
  { value: "연질캡슐", label: "연질캡슐", icon: "🟡" },
];

interface ManualSearchProps {
  t: Record<string, string>;
}

interface SearchResult {
  itemSeq: string;
  itemName: string;
  entpName: string;
  shape: string;
  color1: string;
  color2: string;
  markFront: string;
  markBack: string;
  itemImage: string;
  className: string;
  etcOtc: string;
  detail?: any;
}

export default function ManualSearch({ t }: ManualSearchProps) {
  const [imprint, setImprint] = useState("");
  const [shape, setShape] = useState("");
  const [color, setColor] = useState("");
  const [form, setForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleSearch = async () => {
    if (!imprint && !shape && !color) {
      setError("식별문자, 모양, 색상 중 하나 이상을 선택해주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const params = new URLSearchParams();
      if (imprint) params.set("imprint", imprint);
      if (shape) params.set("shape", shape);
      if (color) params.set("color", color);
      if (form) params.set("form", form);

      const res = await fetch(`/api/search-pill?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "검색 실패");
      setResults(data.results);
      setSelectedIdx(0);
      saveToHistory({
        type: "manual",
        timestamp: Date.now(),
        query: { shape, color, imprint },
        pills: data.results.slice(0, 5).map((r: any) => ({
          name: r.itemName,
          shape: r.shape,
          color: r.color1,
          imprint: r.markFront,
        })),
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImprint("");
    setShape("");
    setColor("");
    setForm("");
    setResults(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="card p-5 space-y-5">
        {/* Imprint input */}
        <div>
          <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">
            식별문자 : 약의 앞면이나 뒷면의 문자
          </label>
          <input
            type="text"
            value={imprint}
            onChange={(e) => setImprint(e.target.value)}
            placeholder="예: GS, 500, ER"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {/* Shape selector */}
        <div>
          <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">모양</label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setShape("")}
              className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs transition-all border ${
                !shape ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent)]"
              }`}
            >
              <span className="text-base">전체</span>
            </button>
            {SHAPES.map((s) => (
              <button
                key={s.value}
                onClick={() => setShape(shape === s.value ? "" : s.value)}
                className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs transition-all border ${
                  shape === s.value ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent)]"
                }`}
              >
                <span className="text-lg leading-none">{s.icon}</span>
                <span className="mt-1">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color selector */}
        <div>
          <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">색상</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setColor("")}
              className={`flex flex-col items-center px-2 py-1.5 rounded-lg text-xs transition-all border ${
                !color ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent)]"
              }`}
            >
              <span className="text-[10px]">색상</span>
              <span className="text-[10px]">전체</span>
            </button>
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(color === c.value ? "" : c.value)}
                className={`flex flex-col items-center px-2 py-1.5 rounded-lg text-xs transition-all border ${
                  color === c.value ? "ring-2 ring-[var(--accent)] border-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent)]"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full ${c.border ? "border border-gray-300" : ""} ${c.pattern ? "bg-[repeating-conic-gradient(#ccc_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]" : ""}`}
                  style={c.pattern ? {} : { backgroundColor: c.hex }}
                />
                <span className="mt-0.5 text-[10px]">{c.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form selector */}
        <div>
          <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">제형</label>
          <div className="flex gap-2">
            {FORMS.map((f) => (
              <button
                key={f.value}
                onClick={() => setForm(form === f.value ? "" : f.value)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
                  form === f.value ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent)]"
                }`}
              >
                {f.icon && <span className="mr-1">{f.icon}</span>}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[var(--accent)] text-white hover:bg-[#6a8880] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "🔍"}{" "}
            약 모양으로 검색
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-xl text-sm font-medium border border-[var(--border)] hover:bg-gray-50 transition-colors"
          >
            다시 입력
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="mt-4 space-y-4 result-section">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[var(--text-primary)]">
                검색 결과 ({results.length}건)
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent)] font-medium">
                모양·각인 검색
              </span>
            </div>

            {results.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">
                일치하는 약품이 없습니다. 조건을 변경해 보세요.
              </p>
            ) : (
              <>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                  {results.slice(0, 10).map((r, i) => (
                    <button
                      key={r.itemSeq}
                      onClick={() => setSelectedIdx(i)}
                      className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        selectedIdx === i
                          ? "bg-[var(--accent)] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {r.itemName?.slice(0, 12)}
                    </button>
                  ))}
                </div>

                {results[selectedIdx] && <PillDetail pill={results[selectedIdx]} t={t} />}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PillDetail({ pill, t }: { pill: SearchResult; t: Record<string, string> }) {
  return (
    <div className="space-y-3">
      {/* Attributes */}
      <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-gray-50">
        {pill.shape && <span className="text-xs text-gray-600">◇ {pill.shape}</span>}
        {pill.color1 && <span className="text-xs text-gray-600">● {pill.color1}{pill.color2 ? `/${pill.color2}` : ""}</span>}
        {pill.markFront && <span className="text-xs font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded">앞: {pill.markFront}</span>}
        {pill.markBack && <span className="text-xs font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded">뒤: {pill.markBack}</span>}
      </div>

      <div>
        <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">{t.drugName}</div>
        <div className="font-medium text-lg">{pill.itemName}</div>
        <div className="text-sm text-[var(--text-muted)]">{pill.entpName}</div>
        {pill.className && <div className="text-xs text-[var(--text-muted)]">{pill.className}</div>}
      </div>

      {pill.itemImage && (
        <img
          src={pill.itemImage}
          alt={pill.itemName}
          className="h-20 rounded-lg object-contain border border-[var(--border)]"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}

      {/* Detail from e약은요 */}
      {pill.detail && (
        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          {pill.detail.efcyQesitm && <InfoBlock label={t.efficacy} value={pill.detail.efcyQesitm} />}
          {pill.detail.useMethodQesitm && <InfoBlock label={t.dosage} value={pill.detail.useMethodQesitm} />}
          {pill.detail.atpnWarnQesitm && <InfoBlock label={t.precautions} value={pill.detail.atpnWarnQesitm} warn />}
          {pill.detail.seQesitm && <InfoBlock label={t.sideEffects} value={pill.detail.seQesitm} />}
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  const [open, setOpen] = useState(false);
  const short = value.length > 150;
  return (
    <div className={`p-3 rounded-xl text-sm ${warn ? "bg-orange-50 border border-orange-100" : "bg-gray-50"}`}>
      <div className="text-xs font-semibold text-[var(--text-muted)] mb-1">{warn && "⚠️ "}{label}</div>
      <p className="text-[var(--text-primary)] leading-relaxed">
        {open || !short ? value : value.slice(0, 150) + "..."}
      </p>
      {short && (
        <button onClick={() => setOpen(!open)} className="text-xs text-[var(--accent)] mt-1 hover:underline">
          {open ? "접기" : "더 보기"}
        </button>
      )}
    </div>
  );
}

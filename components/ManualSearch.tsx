"use client";

import { useState } from "react";
import { saveToHistory } from "@/lib/history";
import { t, type Locale } from "@/lib/i18n";

// shape values stay in Korean (DB internal codes)
const SHAPES = [
  { value: "원형", icon: "○", labelKey: "shapeCircle" },
  { value: "타원형", icon: "⬭", labelKey: "shapeOval" },
  { value: "반원형", icon: "◗", labelKey: "shapeHalfCircle" },
  { value: "삼각형", icon: "△", labelKey: "shapeTriangle" },
  { value: "사각형", icon: "□", labelKey: "shapeSquare" },
  { value: "마름모형", icon: "◇", labelKey: "shapeDiamond" },
  { value: "장방형", icon: "▭", labelKey: "shapeRectangle" },
  { value: "오각형", icon: "⬠", labelKey: "shapePentagon" },
  { value: "육각형", icon: "⬡", labelKey: "shapeHexagon" },
  { value: "팔각형", icon: "⯃", labelKey: "shapeOctagon" },
  { value: "기타", icon: "…", labelKey: "shapeOther" },
];

const COLORS = [
  { value: "하양", hex: "#ffffff", border: true, labelKey: "colorWhite" },
  { value: "노랑", hex: "#FFD700", labelKey: "colorYellow" },
  { value: "주황", hex: "#FF8C00", labelKey: "colorOrange" },
  { value: "분홍", hex: "#FF69B4", labelKey: "colorPink" },
  { value: "빨강", hex: "#DC143C", labelKey: "colorRed" },
  { value: "갈색", hex: "#8B4513", labelKey: "colorBrown" },
  { value: "연두", hex: "#9ACD32", labelKey: "colorLightGreen" },
  { value: "초록", hex: "#228B22", labelKey: "colorGreen" },
  { value: "청록", hex: "#008B8B", labelKey: "colorTeal" },
  { value: "파랑", hex: "#2563EB", labelKey: "colorBlue" },
  { value: "남색", hex: "#191970", labelKey: "colorNavy" },
  { value: "자주", hex: "#800080", labelKey: "colorPurple" },
  { value: "보라", hex: "#9370DB", labelKey: "colorViolet" },
  { value: "회색", hex: "#A9A9A9", labelKey: "colorGray" },
  { value: "검정", hex: "#1a1a1a", labelKey: "colorBlack" },
  { value: "투명", hex: "#f0f0f0", border: true, pattern: true, labelKey: "colorTransparent" },
];

interface ManualSearchProps {
  locale: Locale;
}

interface SearchResult {
  itemSeq?: string;
  itemName: string;
  entpName?: string;
  manufacturer?: string;
  genericName?: string;
  shape?: string;
  color1?: string;
  color2?: string;
  markFront?: string;
  markBack?: string;
  itemImage?: string;
  image?: string; // for global drugs
  className?: string;
  etcOtc?: string;
  detail?: any;
  // Global-specific
  ndc?: string[];
  route?: string;
  dosageForm?: string;
  indications?: string;
  warnings?: string;
  dosage?: string;
  sideEffects?: string;
  _origin?: "korean" | "global";
}

export default function ManualSearch({ locale }: ManualSearchProps) {
  const [name, setName] = useState("");
  const [imprint, setImprint] = useState("");
  const [shape, setShape] = useState("");
  const [color, setColor] = useState("");
  const [form, setForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const FORMS = [
    { value: "", label: t(locale, "searchAllForms") },
    { value: "정제", label: t(locale, "formTablet"), icon: "💊" },
    { value: "경질캡슐", label: t(locale, "formHardCapsule"), icon: "💠" },
    { value: "연질캡슐", label: t(locale, "formSoftCapsule"), icon: "🟡" },
  ];

  const handleSearch = async () => {
    if (!name && !imprint && !shape && !color) {
      setError(t(locale, "searchError"));
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const params = new URLSearchParams();
      if (name) params.set("name", name);
      if (imprint) params.set("imprint", imprint);
      if (shape) params.set("shape", shape);
      if (color) params.set("color", color);
      if (form) params.set("form", form);

      const res = await fetch(`/api/search-pill?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t(locale, "searchFailed"));
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
    setName("");
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
        <div>
          <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">
            🔍 {t(locale, "drugName")} ({locale === "ko" ? "국내·해외 통합 검색" : "Korean & Global"})
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={locale === "ko" ? "예: 타이레놀, Tylenol, 아스피린" : "e.g. Tylenol, Aspirin, 타이레놀"}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">
            {t(locale, "imprintInputLabel")}
          </label>
          <input
            type="text"
            value={imprint}
            onChange={(e) => setImprint(e.target.value)}
            placeholder={t(locale, "imprintInputPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">
            {t(locale, "shapeLabel")}
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setShape("")}
              className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs transition-all border ${
                !shape ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent)]"
              }`}
            >
              <span className="text-base">{t(locale, "searchAll")}</span>
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
                <span className="mt-1">{s.value}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">
            {t(locale, "colorLabel")}
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setColor("")}
              className={`flex flex-col items-center px-2 py-1.5 rounded-lg text-xs transition-all border ${
                !color ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent)]"
              }`}
            >
              <span className="text-[10px]">{t(locale, "searchAllColors")}</span>
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
                  className={`w-6 h-6 rounded-full ${c.border ? "border border-gray-300" : ""}`}
                  style={c.pattern ? {} : { backgroundColor: c.hex }}
                />
                <span className="mt-0.5 text-[10px]">{c.value}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">
            {t(locale, "formLabel")}
          </label>
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

        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[var(--accent)] text-white hover:bg-[#6a8880] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "🔍"}{" "}
            {t(locale, "searchByShapeBtn")}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-xl text-sm font-medium border border-[var(--border)] hover:bg-gray-50 transition-colors"
          >
            {t(locale, "resetBtn")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {results && (
        <div className="mt-4 space-y-4 result-section">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[var(--text-primary)]">
                {t(locale, "searchResults", { n: results.length })}
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent)] font-medium">
                {t(locale, "searchMethodAttr")}
              </span>
            </div>

            {results.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">
                {t(locale, "noManualResult")}
              </p>
            ) : (
              <>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                  {results.slice(0, 15).map((r, i) => (
                    <button
                      key={(r.itemSeq || r.itemName) + i}
                      onClick={() => setSelectedIdx(i)}
                      className={`shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        selectedIdx === i
                          ? "bg-[var(--accent)] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <span>{r._origin === "global" ? "🌐" : "🇰🇷"}</span>
                      <span>{r.itemName?.slice(0, 12)}</span>
                    </button>
                  ))}
                </div>

                {results[selectedIdx] && <PillDetail pill={results[selectedIdx]} locale={locale} />}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PillDetail({ pill, locale }: { pill: SearchResult; locale: Locale }) {
  const isGlobal = pill._origin === "global";
  const image = pill.image || pill.itemImage;
  const manufacturer = pill.manufacturer || pill.entpName;

  return (
    <div className="space-y-3">
      {/* Origin badge */}
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isGlobal ? "bg-blue-100 text-blue-700" : "bg-[var(--accent-light)] text-[var(--accent)]"
        }`}>
          {isGlobal ? "🌐 " + t(locale, "globalDB") : "🇰🇷 " + t(locale, "koreanDB")}
        </span>
      </div>

      {/* Header with image */}
      <div className="flex items-start gap-4">
        {image && (
          <img
            src={image}
            alt={pill.itemName}
            className="w-24 h-24 rounded-xl object-contain bg-white border border-[var(--border)] shrink-0 shadow-sm"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">{t(locale, "drugName")}</div>
          <div className="font-medium text-lg">{pill.itemName}</div>
          {pill.genericName && (
            <div className="text-sm text-[var(--text-muted)]">
              <span className="text-xs">{t(locale, "globalGenericName")}: </span>{pill.genericName}
            </div>
          )}
          {manufacturer && <div className="text-sm text-[var(--text-muted)]">{manufacturer}</div>}
          {pill.className && <div className="text-xs text-[var(--text-muted)]">{pill.className}</div>}
        </div>
      </div>

      {/* Korean attributes */}
      {!isGlobal && (pill.shape || pill.color1 || pill.markFront) && (
        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-gray-50">
          {pill.shape && <span className="text-xs text-gray-600">◇ {pill.shape}</span>}
          {pill.color1 && <span className="text-xs text-gray-600">● {pill.color1}{pill.color2 ? `/${pill.color2}` : ""}</span>}
          {pill.markFront && <span className="text-xs font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded">{t(locale, "imprintFront")}: {pill.markFront}</span>}
          {pill.markBack && <span className="text-xs font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded">{t(locale, "imprintBack")}: {pill.markBack}</span>}
        </div>
      )}

      {/* Global attributes */}
      {isGlobal && (pill.dosageForm || pill.route || pill.ndc?.[0]) && (
        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-gray-50">
          {pill.dosageForm && <span className="text-xs text-gray-600">{pill.dosageForm}</span>}
          {pill.route && <span className="text-xs text-gray-600">{t(locale, "globalRoute")}: {pill.route}</span>}
          {pill.ndc?.[0] && <span className="text-xs font-mono text-gray-600">{t(locale, "globalNDC")}: {pill.ndc[0]}</span>}
        </div>
      )}

      {/* Korean detail */}
      {!isGlobal && pill.detail && (
        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          {pill.detail.efcyQesitm && <InfoBlock label={t(locale, "efficacy")} value={pill.detail.efcyQesitm} locale={locale} />}
          {pill.detail.useMethodQesitm && <InfoBlock label={t(locale, "dosage")} value={pill.detail.useMethodQesitm} locale={locale} />}
          {pill.detail.atpnWarnQesitm && <InfoBlock label={t(locale, "precautions")} value={pill.detail.atpnWarnQesitm} warn locale={locale} />}
          {pill.detail.seQesitm && <InfoBlock label={t(locale, "sideEffects")} value={pill.detail.seQesitm} locale={locale} />}
        </div>
      )}

      {/* Global detail */}
      {isGlobal && (
        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          {pill.indications && <InfoBlock label={t(locale, "globalIndications")} value={pill.indications} locale={locale} />}
          {pill.dosage && <InfoBlock label={t(locale, "dosage")} value={pill.dosage} locale={locale} />}
          {pill.warnings && <InfoBlock label={t(locale, "globalWarnings")} value={pill.warnings} warn locale={locale} />}
          {pill.sideEffects && <InfoBlock label={t(locale, "sideEffects")} value={pill.sideEffects} locale={locale} />}
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value, warn, locale }: { label: string; value: string; warn?: boolean; locale: Locale }) {
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
          {open ? t(locale, "showLess") : t(locale, "showMore")}
        </button>
      )}
    </div>
  );
}

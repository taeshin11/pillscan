"use client";

import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";

interface Props {
  locale: Locale;
}

interface GlobalDrug {
  itemName: string;
  genericName: string;
  manufacturer: string;
  ndc: string[];
  route: string;
  dosageForm: string;
  indications: string;
  warnings: string;
  dosage: string;
  sideEffects: string;
  interactions: string;
  storage: string;
  image?: string;
}

export default function GlobalSearch({ locale }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GlobalDrug[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError(t(locale, "searchError"));
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch(`/api/search-global?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t(locale, "searchFailed"));
      setResults(data.results || []);
      setSelectedIdx(0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="card p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            {t(locale, "globalSearchTitle")}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            {t(locale, "globalSearchSubtitle")}
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t(locale, "globalSearchPlaceholder")}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-5 py-3 rounded-xl text-sm font-semibold bg-[var(--accent)] text-white hover:bg-[#6a8880] transition-all disabled:opacity-60"
          >
            {loading ? "..." : t(locale, "globalSearchBtn")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {results && results.length === 0 && (
        <div className="mt-4 card p-6 text-center text-[var(--text-muted)]">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-sm">{t(locale, "noManualResult")}</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="mt-4 space-y-4 result-section">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{t(locale, "searchResults", { n: results.length })}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                {t(locale, "globalDB")}
              </span>
            </div>

            {results.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                {results.slice(0, 10).map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIdx(i)}
                    className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedIdx === i
                        ? "bg-[var(--accent)] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {r.itemName?.slice(0, 16)}
                  </button>
                ))}
              </div>
            )}

            <DrugDetail drug={results[selectedIdx]} locale={locale} />
          </div>
        </div>
      )}
    </div>
  );
}

function DrugDetail({ drug, locale }: { drug: GlobalDrug; locale: Locale }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        {drug.image && (
          <img
            src={drug.image}
            alt={drug.itemName}
            className="w-24 h-24 rounded-xl object-contain bg-white border border-[var(--border)] shrink-0 shadow-sm"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">
            {t(locale, "drugName")}
          </div>
          <div className="font-medium text-lg">{drug.itemName}</div>
          {drug.genericName && (
            <div className="text-sm text-[var(--text-muted)]">
              <span className="text-xs">{t(locale, "globalGenericName")}: </span>
              {drug.genericName}
            </div>
          )}
          {drug.manufacturer && (
            <div className="text-sm text-[var(--text-muted)]">{drug.manufacturer}</div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {drug.dosageForm && (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
            {drug.dosageForm}
          </span>
        )}
        {drug.route && (
          <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">
            {t(locale, "globalRoute")}: {drug.route}
          </span>
        )}
        {drug.ndc?.[0] && (
          <span className="text-xs font-mono px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {t(locale, "globalNDC")}: {drug.ndc[0]}
          </span>
        )}
      </div>

      {drug.indications && <Block label={t(locale, "globalIndications")} value={drug.indications} />}
      {drug.dosage && <Block label={t(locale, "globalDosage")} value={drug.dosage} />}
      {drug.warnings && <Block label={t(locale, "globalWarnings")} value={drug.warnings} warn />}
      {drug.sideEffects && <Block label={t(locale, "sideEffects")} value={drug.sideEffects} />}
    </div>
  );
}

function Block({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  const [open, setOpen] = useState(false);
  const short = value.length > 200;
  return (
    <div className={`p-3 rounded-xl text-sm ${warn ? "bg-orange-50 border border-orange-100" : "bg-gray-50"}`}>
      <div className="text-xs font-semibold text-[var(--text-muted)] mb-1">
        {warn && "⚠️ "}{label}
      </div>
      <p className="text-[var(--text-primary)] leading-relaxed">
        {open || !short ? value : value.slice(0, 200) + "..."}
      </p>
      {short && (
        <button onClick={() => setOpen(!open)} className="text-xs text-[var(--accent)] mt-1 hover:underline">
          {open ? "−" : "+"}
        </button>
      )}
    </div>
  );
}

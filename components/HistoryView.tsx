"use client";

import { useEffect, useState } from "react";
import { loadHistory, deleteHistoryEntry, clearHistory, type HistoryEntry } from "@/lib/history";
import { t, type Locale } from "@/lib/i18n";

export default function HistoryView({ locale }: { locale: Locale }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEntries(loadHistory());
    setMounted(true);
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id);
    setEntries(loadHistory());
  };

  const handleClearAll = () => {
    if (confirm(t(locale, "historyDeleteConfirm"))) {
      clearHistory();
      setEntries([]);
    }
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return t(locale, "historyJustNow");
    if (diff < 3600000) return t(locale, "historyMinAgo", { n: Math.floor(diff / 60000) });
    if (diff < 86400000) return t(locale, "historyHourAgo", { n: Math.floor(diff / 3600000) });
    if (diff < 604800000) return t(locale, "historyDayAgo", { n: Math.floor(diff / 86400000) });
    return d.toLocaleDateString(locale === "ko" ? "ko-KR" : locale, { month: "short", day: "numeric" });
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {entries.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">📖</div>
          <p className="text-base font-semibold text-[var(--text-primary)] mb-1">{t(locale, "historyEmpty")}</p>
          <p className="text-sm text-[var(--text-muted)]">{t(locale, "historyEmptyHint")}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[var(--text-muted)]">
              {t(locale, "historyTotal", { n: entries.length })}
            </p>
            <button
              onClick={handleClearAll}
              className="text-xs px-3 py-1.5 rounded-full text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
            >
              {t(locale, "historyDeleteAll")}
            </button>
          </div>

          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="card p-4">
                <div className="flex gap-3">
                  {entry.thumbnail && (
                    <img
                      src={entry.thumbnail}
                      alt=""
                      className="w-16 h-16 object-cover rounded-xl shrink-0 bg-gray-100"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] font-medium">
                        {entry.type === "photo" ? t(locale, "historyTypePhoto") : t(locale, "historyTypeManual")}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] shrink-0">{formatDate(entry.timestamp)}</span>
                    </div>

                    {entry.pills.length > 0 ? (
                      <div className="space-y-1">
                        {entry.pills.slice(0, 3).map((p, i) => (
                          <div key={i} className="text-sm text-[var(--text-primary)] truncate">
                            <span className="font-medium">{p.name}</span>
                            {(p.shape || p.color) && (
                              <span className="ml-1 text-xs text-[var(--text-muted)]">
                                · {[p.color, p.shape].filter(Boolean).join(" ")}
                                {p.imprint && ` · [${p.imprint}]`}
                              </span>
                            )}
                          </div>
                        ))}
                        {entry.pills.length > 3 && (
                          <div className="text-xs text-[var(--text-muted)]">{t(locale, "historyMore", { n: entry.pills.length - 3 })}</div>
                        )}
                      </div>
                    ) : entry.query ? (
                      <div className="text-sm text-[var(--text-muted)]">
                        {[entry.query.color, entry.query.shape, entry.query.imprint && `[${entry.query.imprint}]`]
                          .filter(Boolean).join(" · ")}
                      </div>
                    ) : (
                      <div className="text-sm text-[var(--text-muted)]">{t(locale, "historyNoResult")}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors shrink-0 self-start"
                    aria-label={t(locale, "historyDelete")}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-center text-[var(--text-muted)] mt-4">
            {t(locale, "historyPrivacy")}
          </p>
        </>
      )}
    </div>
  );
}

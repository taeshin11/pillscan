"use client";

import { useEffect, useState } from "react";
import { loadHistory, deleteHistoryEntry, clearHistory, type HistoryEntry } from "@/lib/history";

export default function HistoryView() {
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
    if (confirm("모든 검색 기록을 삭제하시겠습니까?")) {
      clearHistory();
      setEntries([]);
    }
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return "방금 전";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}일 전`;
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {entries.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">📖</div>
          <p className="text-base font-semibold text-[var(--text-primary)] mb-1">검색 기록이 없습니다</p>
          <p className="text-sm text-[var(--text-muted)]">
            사진으로 약을 찾으면 여기에 자동으로 저장됩니다.
            <br />
            기록은 이 브라우저에만 저장되며 외부로 전송되지 않아요.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[var(--text-muted)]">
              총 <strong className="text-[var(--text-primary)]">{entries.length}</strong>개의 기록
            </p>
            <button
              onClick={handleClearAll}
              className="text-xs px-3 py-1.5 rounded-full text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
            >
              전체 삭제
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
                        {entry.type === "photo" ? "📷 사진" : "🔍 수동"}
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
                          <div className="text-xs text-[var(--text-muted)]">외 {entry.pills.length - 3}개</div>
                        )}
                      </div>
                    ) : entry.query ? (
                      <div className="text-sm text-[var(--text-muted)]">
                        {[entry.query.color, entry.query.shape, entry.query.imprint && `[${entry.query.imprint}]`]
                          .filter(Boolean).join(" · ")}
                      </div>
                    ) : (
                      <div className="text-sm text-[var(--text-muted)]">결과 없음</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors shrink-0 self-start"
                    aria-label="삭제"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-center text-[var(--text-muted)] mt-4">
            🔒 기록은 이 기기에만 저장됩니다 (서버 전송 없음)
          </p>
        </>
      )}
    </div>
  );
}

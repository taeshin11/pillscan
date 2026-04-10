"use client";

import { useState } from "react";
import type { Locale } from "@/lib/translations";
import { translations } from "@/lib/translations";
import PillScanner from "./PillScanner";
import ManualSearch from "./ManualSearch";

interface TabContainerProps {
  locale: Locale;
}

export default function TabContainer({ locale }: TabContainerProps) {
  const t = translations[locale];
  const [activeTab, setActiveTab] = useState<"photo" | "manual">("photo");

  return (
    <div>
      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <div className="flex rounded-xl bg-white border border-[var(--border)] p-1">
          <button
            onClick={() => setActiveTab("photo")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === "photo"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            📷 사진으로 찾기
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === "manual"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            🔍 약 모양으로 찾기
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "photo" ? (
        <PillScanner locale={locale} />
      ) : (
        <ManualSearch t={t} />
      )}
    </div>
  );
}

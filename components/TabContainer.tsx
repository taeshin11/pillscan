"use client";

import { useState } from "react";
import type { Locale } from "@/lib/translations";
import { translations } from "@/lib/translations";
import PillScanner from "./PillScanner";
import ManualSearch from "./ManualSearch";
import PillCounter from "./PillCounter";
import HistoryView from "./HistoryView";

interface TabContainerProps {
  locale: Locale;
}

type TabId = "photo" | "manual" | "count" | "history";

export default function TabContainer({ locale }: TabContainerProps) {
  const t = translations[locale];
  const [activeTab, setActiveTab] = useState<TabId>("photo");

  const tabs: { id: TabId; label: string }[] = [
    { id: "photo", label: "📷 사진" },
    { id: "manual", label: "🔍 모양" },
    { id: "count", label: "🔢 개수" },
    { id: "history", label: "📖 기록" },
  ];

  return (
    <div>
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <div className="flex rounded-xl bg-white border border-[var(--border)] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-1 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "photo" && <PillScanner locale={locale} />}
      {activeTab === "manual" && <ManualSearch t={t} />}
      {activeTab === "count" && <PillCounter />}
      {activeTab === "history" && <HistoryView />}
    </div>
  );
}

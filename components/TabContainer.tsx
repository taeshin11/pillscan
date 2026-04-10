"use client";

import { useState } from "react";
import type { Locale } from "@/lib/translations";
import { translations } from "@/lib/translations";
import PillScanner from "./PillScanner";
import ManualSearch from "./ManualSearch";
import PillCounter from "./PillCounter";

interface TabContainerProps {
  locale: Locale;
}

export default function TabContainer({ locale }: TabContainerProps) {
  const t = translations[locale];
  const [activeTab, setActiveTab] = useState<"photo" | "manual" | "count">("photo");

  const tabs = [
    { id: "photo" as const, label: "📷 사진으로 찾기" },
    { id: "manual" as const, label: "🔍 모양으로 찾기" },
    { id: "count" as const, label: "🔢 개수 세기" },
  ];

  return (
    <div>
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <div className="flex rounded-xl bg-white border border-[var(--border)] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
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
    </div>
  );
}

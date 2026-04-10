"use client";

import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";
import PillScanner from "./PillScanner";
import ManualSearch from "./ManualSearch";
import PillCounter from "./PillCounter";
import HistoryView from "./HistoryView";
import GlobalSearch from "./GlobalSearch";

interface TabContainerProps {
  locale: Locale;
}

type TabId = "photo" | "manual" | "global" | "count" | "history";

export default function TabContainer({ locale }: TabContainerProps) {
  const [activeTab, setActiveTab] = useState<TabId>("photo");

  const tabs: { id: TabId; key: any }[] = [
    { id: "photo", key: "tabPhoto" },
    { id: "manual", key: "tabManual" },
    { id: "global", key: "tabGlobal" },
    { id: "count", key: "tabCount" },
    { id: "history", key: "tabHistory" },
  ];

  return (
    <div>
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <div className="flex rounded-xl bg-white border border-[var(--border)] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t(locale, tab.key)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "photo" && <PillScanner locale={locale} />}
      {activeTab === "manual" && <ManualSearch locale={locale} />}
      {activeTab === "global" && <GlobalSearch locale={locale} />}
      {activeTab === "count" && <PillCounter locale={locale} />}
      {activeTab === "history" && <HistoryView locale={locale} />}
    </div>
  );
}

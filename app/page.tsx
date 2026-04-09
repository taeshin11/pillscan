import { headers } from "next/headers";
import { detectLocale } from "@/lib/translations";
import PillScanner from "@/components/PillScanner";
import { translations } from "@/lib/translations";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PillScan — AI 알약 판별 서비스",
  description:
    "알약 사진 하나로 약품명, 효능, 용법, 부작용까지 즉시 확인. AI 기반 무료 알약 판별 서비스.",
};

export default async function HomePage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "ko";
  const locale = detectLocale(acceptLanguage);
  const t = translations[locale];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        name: "PillScan",
        description: "AI 기반 알약 판별 서비스",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://pillscan.vercel.app",
        inLanguage: ["ko", "en", "ja", "zh"],
        audience: { "@type": "Patient" },
        specialty: "Pharmacy",
      },
      {
        "@type": "SoftwareApplication",
        name: "PillScan",
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
        {/* Header */}
        <header
          className="sticky top-0 z-10 backdrop-blur-sm border-b border-[var(--border)]"
          style={{ backgroundColor: "rgba(250,248,245,0.92)" }}
        >
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💊</span>
              <div>
                <span className="font-bold text-lg text-[var(--text-primary)]">{t.title}</span>
                <span className="ml-2 text-xs text-[var(--text-muted)] hidden sm:inline">
                  {t.subtitle}
                </span>
              </div>
            </div>
            <a
              href={`mailto:taeshinkim11@gmail.com?subject=PillScan 개선 제안`}
              className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              {t.feedbackBtn}
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-8 pb-6 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
              {t.subtitle}
            </h1>
            <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-md mx-auto">
              {t.description}
            </p>
          </div>
        </section>

        {/* Main scanner */}
        <main className="flex-1 pb-12">
          <PillScanner locale={locale} />
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] py-5 px-4">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-3">
              <span>{t.footerBrand}</span>
              <span className="opacity-30">·</span>
              <a
                href={`mailto:taeshinkim11@gmail.com?subject=PillScan 개선 제안`}
                className="hover:text-[var(--accent)] transition-colors"
              >
                {t.feedbackBtn}
              </a>
            </div>
            <div className="opacity-60 text-center">
              ⚕️ 의료 전문가의 판단을 대체하지 않습니다
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

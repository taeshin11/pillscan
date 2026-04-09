import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pillscan.vercel.app"),
  title: {
    default: "PillScan — AI 알약 판별 서비스",
    template: "%s | PillScan",
  },
  description:
    "AI 기반 알약 판별 서비스. 알약 사진을 촬영하거나 업로드하면 약품명, 효능, 용법, 주의사항을 즉시 알려드립니다. Identify any pill instantly with AI.",
  keywords: [
    "알약 판별", "알약 확인", "약품 검색", "pill identifier", "pill scanner",
    "medication identification", "약 이름 찾기", "PillScan", "KIMS", "드럭인포"
  ],
  openGraph: {
    title: "PillScan — AI 알약 판별 서비스",
    description: "알약 사진 하나로 약품 정보를 즉시 확인하세요.",
    type: "website",
    locale: "ko_KR",
    alternateLocale: ["en_US", "ja_JP", "zh_CN"],
    siteName: "PillScan",
  },
  twitter: {
    card: "summary_large_image",
    title: "PillScan — AI Pill Identifier",
    description: "Identify any pill instantly with AI vision.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-noto)]">
        {children}
      </body>
    </html>
  );
}

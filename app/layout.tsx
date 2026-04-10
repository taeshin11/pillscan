import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Footer from "@/components/Footer";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pillscan-ai.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PillScan — Free AI Pill Identifier | 알약 판별",
    template: "%s | PillScan",
  },
  description:
    "Free AI pill identifier — recognize any medication by shape, color, and imprint from a database of 40,000+ drugs. 무료 AI 알약 판별 서비스.",
  keywords: [
    "pill identifier", "pill identification", "medication identifier", "pill scanner",
    "AI pill recognition", "drug identifier", "medication lookup", "pill finder",
    "what pill is this", "identify medication", "pill ID", "free pill identifier",
    "알약 판별", "알약 확인", "약품 검색", "약 이름 찾기", "PillScan",
  ],
  authors: [{ name: "SPINAI" }],
  creator: "SPINAI",
  publisher: "PillScan",
  category: "health",
  openGraph: {
    title: "PillScan — Free AI Pill Identifier",
    description: "Identify any pill instantly with AI vision. Free, no signup required. 25,000+ Korean and FDA medications.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["ko_KR", "ja_JP", "zh_CN", "es_ES", "fr_FR", "de_DE"],
    siteName: "PillScan",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
        alt: "PillScan logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PillScan — Free AI Pill Identifier",
    description: "Identify any pill instantly with AI vision. 25,000+ medications database.",
    images: [`${SITE_URL}/icon-512.png`],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "ko-KR": "/",
      "ja-JP": "/",
      "zh-CN": "/",
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  other: {
    "google-adsense-account": process.env.GOOGLE_ADSENSE_ID || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${notoSansKR.variable} h-full`}>
      <head>
        {/* Google AdSense */}
        {process.env.GOOGLE_ADSENSE_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.GOOGLE_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-noto)]">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

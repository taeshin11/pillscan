import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Developer API — PillScan",
  description:
    "Integrate pill identification into your app with PillScan's Developer API. Visual search, imprint OCR, and image enhancement — pay-as-you-go pricing.",
  keywords: ["pillscan api", "pill identification api", "medication api", "drug identification api", "developer api"],
  openGraph: {
    title: "PillScan Developer API",
    description: "Integrate AI pill identification into your app. Pay-as-you-go pricing starting at $0.001/call.",
    url: "https://pillscan-ai.vercel.app/developers",
    type: "website",
  },
  alternates: { canonical: "/developers" },
};

const ENDPOINTS = [
  {
    method: "POST",
    path: "/identify",
    price: "$0.005",
    per1k: "$5.00",
    desc: "Full pipeline — CLIP visual search + YOLO imprint OCR + metadata lookup",
    response: `{
  "imprint": "GC",
  "visual_matches": [
    {
      "itemSeq": "200808876",
      "itemName": "타이레놀정500mg",
      "entpName": "한국존슨앤드존슨판매(유)",
      "similarity": 0.89
    }
  ]
}`,
  },
  {
    method: "POST",
    path: "/search",
    price: "$0.002",
    per1k: "$2.00",
    desc: "CLIP visual similarity search — top-K matches from 25,000+ pills",
    response: `{
  "results": [
    {
      "itemSeq": "200808876",
      "itemName": "타이레놀정500mg",
      "similarity": 0.89,
      "shape": "원형",
      "color1": "흰색"
    }
  ]
}`,
  },
  {
    method: "POST",
    path: "/ocr-imprint",
    price: "$0.002",
    per1k: "$2.00",
    desc: "YOLO-based imprint character detection on pill surface",
    response: `{
  "imprint": "GC",
  "detections": [
    {"label": "G", "confidence": 0.95, "bbox": [12, 34, 56, 78]},
    {"label": "C", "confidence": 0.92, "bbox": [60, 34, 90, 78]}
  ]
}`,
  },
  {
    method: "POST",
    path: "/enhance",
    price: "$0.001",
    per1k: "$1.00",
    desc: "Image enhancement for better imprint readability (CLAHE + edge boost)",
    response: `{
  "image": "<base64 JPEG>",
  "mimeType": "image/jpeg"
}`,
  },
];

export default function DevelopersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-[var(--accent)] hover:underline">
        ← Home
      </Link>

      {/* Hero */}
      <div className="mt-6 mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-[var(--text-primary)]">
          PillScan Developer API
        </h1>
        <p className="text-[var(--text-muted)] text-lg mb-6">
          AI pill identification for your app — visual search, imprint OCR, and image enhancement.
          Pay only for what you use.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://pillscan.lemonsqueezy.com/checkout"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Get API Key
          </a>
          <Link
            href="/developers/dashboard"
            className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)]"
          >
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {[
          { value: "25,000+", label: "Pills indexed" },
          { value: "$0.005", label: "Per identify call" },
          { value: "60/min", label: "Rate limit" },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-xl font-bold text-[var(--text-primary)]">{s.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Start */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Quick Start</h2>
        <div className="card p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
              1. Get your API key
            </p>
            <p className="text-sm text-[var(--text-primary)]">
              Click <strong>Get API Key</strong> above. After adding a payment method,
              your key is emailed to you instantly.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
              2. Make your first call
            </p>
            <pre className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-4 text-sm overflow-x-auto">
              <code>{`curl -X POST https://api.pillscan-ai.com/identify \\
  -H "X-API-Key: ps_your_key_here" \\
  -F "file=@pill_photo.jpg"`}</code>
            </pre>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
              3. Monitor usage
            </p>
            <pre className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-4 text-sm overflow-x-auto">
              <code>{`# Every response includes usage headers:
X-Call-Cost: 0.005
X-Monthly-Cost: 1.23
X-Monthly-Calls: 246

# Or check the dashboard:
curl https://api.pillscan-ai.com/usage \\
  -H "X-API-Key: ps_your_key_here"`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Pricing</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-primary)]">
                <th className="text-left p-4 font-semibold text-[var(--text-primary)]">Endpoint</th>
                <th className="text-right p-4 font-semibold text-[var(--text-primary)]">Per Call</th>
                <th className="text-right p-4 font-semibold text-[var(--text-primary)]">Per 1,000</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((ep) => (
                <tr key={ep.path} className="border-b border-[var(--border)] last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-[var(--accent-light)] text-[var(--accent)]">
                        {ep.method}
                      </span>
                      <code className="font-medium text-[var(--text-primary)]">{ep.path}</code>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{ep.desc}</p>
                  </td>
                  <td className="p-4 text-right font-mono font-semibold text-[var(--text-primary)]">{ep.price}</td>
                  <td className="p-4 text-right font-mono text-[var(--text-muted)]">{ep.per1k}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          No free tier · No monthly minimum · Billed monthly · 60 req/min rate limit
        </p>
      </section>

      {/* Endpoints reference */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">API Reference</h2>
        <div className="space-y-3">
          {ENDPOINTS.map((ep) => (
            <details key={ep.path} className="card group">
              <summary className="p-4 cursor-pointer flex items-center justify-between list-none">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--accent-light)] text-[var(--accent)]">
                    {ep.method}
                  </span>
                  <code className="font-medium text-[var(--text-primary)]">{ep.path}</code>
                  <span className="text-xs text-[var(--text-muted)] hidden sm:inline">{ep.desc}</span>
                </div>
                <span className="text-xs text-[var(--text-muted)]">{ep.price}</span>
              </summary>
              <div className="px-4 pb-4 border-t border-[var(--border)] pt-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Request</p>
                  <pre className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-3 text-xs overflow-x-auto">
                    <code>{`curl -X ${ep.method} https://api.pillscan-ai.com${ep.path} \\
  -H "X-API-Key: ps_your_key_here" \\
  -F "file=@pill_photo.jpg"`}</code>
                  </pre>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Response</p>
                  <pre className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-3 text-xs overflow-x-auto">
                    <code>{ep.response}</code>
                  </pre>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Auth / Errors */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Authentication & Errors</h2>
        <div className="card p-5">
          <p className="text-sm text-[var(--text-primary)] mb-4">
            Pass your API key in the <code className="bg-[var(--bg-primary)] px-1.5 py-0.5 rounded">X-API-Key</code> header on every request.
          </p>
          <div className="space-y-2 text-sm">
            {[
              { code: "401", color: "var(--danger)", title: "Invalid or missing API key", sub: "Check the X-API-Key header" },
              { code: "402", color: "var(--warning)", title: "Payment required", sub: "Add a payment method to activate your key" },
              { code: "429", color: "var(--warning)", title: "Rate limit exceeded", sub: "Max 60 requests/minute — retry after a moment" },
              { code: "503", color: "var(--text-muted)", title: "Model not loaded", sub: "Server is starting up — retry in a few seconds" },
            ].map((e) => (
              <div key={e.code} className="flex items-start gap-3 p-3 bg-[var(--bg-primary)] rounded-lg">
                <span className="font-mono font-bold text-xs mt-0.5 w-8 shrink-0" style={{ color: e.color }}>{e.code}</span>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{e.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{e.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code examples */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Code Examples</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card p-4">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Python</p>
            <pre className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-3 text-xs overflow-x-auto">
              <code>{`import requests

resp = requests.post(
    "https://api.pillscan-ai.com/identify",
    headers={"X-API-Key": "ps_..."},
    files={"file": open("pill.jpg", "rb")},
)
data = resp.json()
print(data["visual_matches"][0]["itemName"])
# 타이레놀정500mg`}</code>
            </pre>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">JavaScript</p>
            <pre className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-3 text-xs overflow-x-auto">
              <code>{`const form = new FormData();
form.append("file", file); // File object

const res = await fetch(
  "https://api.pillscan-ai.com/identify",
  {
    method: "POST",
    headers: { "X-API-Key": "ps_..." },
    body: form,
  }
);
const { visual_matches } = await res.json();`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="card p-8 text-center" style={{ background: "var(--accent-light)" }}>
        <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Start building today</h2>
        <p className="text-[var(--text-muted)] mb-6 text-sm">
          Key issuance is free. You only pay for API calls you make.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://pillscan.lemonsqueezy.com/checkout"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl font-semibold text-white text-sm"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Get API Key
          </a>
          <Link
            href="/developers/dashboard"
            className="px-6 py-3 rounded-xl font-semibold text-sm border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)]"
          >
            Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}

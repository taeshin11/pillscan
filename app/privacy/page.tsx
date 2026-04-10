import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — PillScan",
  description:
    "PillScan's privacy policy. Learn how we protect your data, our cookie usage, and your rights when using our free pill identification tool.",
  keywords: ["pillscan privacy", "pill identifier privacy", "data protection", "cookie policy"],
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — PillScan",
    description: "How PillScan protects your privacy and handles your data.",
    url: "https://pillscan-ai.vercel.app/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-[var(--accent)] hover:underline">← Back to Home</Link>
      <h1 className="text-3xl sm:text-4xl font-bold mt-4 mb-2 text-[var(--text-primary)]">Privacy Policy</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">Last updated: April 10, 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">1. Introduction</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          PillScan ("we," "our," or "us") is committed to protecting the privacy of every visitor and user of our
          free pill identification web application available at <strong>pillscan-ai.vercel.app</strong> ("the Service").
          This Privacy Policy describes what information we collect, how we use it, who we share it with, and what
          rights you have regarding your data. By using PillScan, you agree to the practices described in this policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">2. Information We Collect</h2>
        <h3 className="font-semibold mt-4 mb-2">2.1 Information You Provide</h3>
        <p className="leading-relaxed text-[var(--text-primary)] mb-3">
          When you use PillScan to identify a pill, you upload an image file from your device. This image is
          transmitted to our servers and processed by our AI analysis pipeline. By default, the image is
          discarded immediately after analysis and never saved.
        </p>
        <p className="leading-relaxed text-[var(--text-primary)] mb-3">
          <strong>Optional Data Contribution:</strong> After receiving your identification result, you may
          choose to contribute the image to PillScan's AI training dataset by clicking the explicit
          "기여하기 / Contribute" button. This is entirely optional and opt-in. If you consent:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-[var(--text-primary)] mb-3">
          <li>The image is stored anonymously with a random UUID identifier</li>
          <li>No IP address, account, email, or device identifier is linked to the image</li>
          <li>The image is used only to improve PillScan's pill identification accuracy</li>
          <li>The image is never sold, shared with advertisers, or made publicly available</li>
          <li>You may request deletion at any time by emailing <a href="mailto:taeshinkim11@gmail.com" className="text-[var(--accent)] underline">taeshinkim11@gmail.com</a></li>
        </ul>
        <p className="leading-relaxed text-[var(--text-primary)] mb-3">
          If you do not click the contribute button, your image is permanently discarded after analysis
          and we retain no copy of it.
        </p>

        <h3 className="font-semibold mt-4 mb-2">2.2 Automatically Collected Information</h3>
        <p className="leading-relaxed text-[var(--text-primary)] mb-3">
          When you visit PillScan, our hosting provider (Vercel) and analytics services may automatically collect
          standard log information, including:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-[var(--text-primary)]">
          <li>IP address (anonymized after aggregation)</li>
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>Referring website</li>
          <li>Pages visited and time spent on each page</li>
          <li>Approximate geographic location (country/region only)</li>
        </ul>
        <p className="leading-relaxed text-[var(--text-primary)] mt-3">
          This information is used solely for analytics, security monitoring, and performance optimization.
        </p>

        <h3 className="font-semibold mt-4 mb-2">2.3 Locally Stored Data</h3>
        <p className="leading-relaxed text-[var(--text-primary)]">
          PillScan uses your browser's localStorage to save your search history (up to 30 entries). This data is
          stored exclusively on your device and is never transmitted to our servers. You can delete your search
          history at any time from the History tab in the application.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">3. Cookies and Tracking Technologies</h2>
        <p className="leading-relaxed text-[var(--text-primary)] mb-3">
          PillScan may use the following cookies and similar technologies:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--text-primary)]">
          <li><strong>Essential cookies:</strong> Required for basic site functionality, language detection, and session management.</li>
          <li><strong>Analytics cookies:</strong> We may use Google Analytics to understand how visitors use the Service. These cookies collect aggregated, anonymous information.</li>
          <li><strong>Advertising cookies:</strong> If we display advertisements through Google AdSense, third-party vendors including Google may use cookies to serve ads based on a user's prior visits to this and other websites. Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-[var(--accent)] underline">Google Ads Settings</a> or <a href="https://www.aboutads.info/" className="text-[var(--accent)] underline">aboutads.info</a>.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">4. Third-Party Services</h2>
        <p className="leading-relaxed text-[var(--text-primary)] mb-3">
          PillScan relies on the following third-party services to provide its functionality:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[var(--text-primary)]">
          <li><strong>Google Gemini API:</strong> Uploaded images are sent to Google's Gemini multimodal AI service for vision analysis. Google's processing of this data is governed by the <a href="https://policies.google.com/privacy" className="text-[var(--accent)] underline">Google Privacy Policy</a>.</li>
          <li><strong>Vercel:</strong> Our hosting provider. Vercel's data practices are described in the <a href="https://vercel.com/legal/privacy-policy" className="text-[var(--accent)] underline">Vercel Privacy Policy</a>.</li>
          <li><strong>Korean MFDS Open Data:</strong> Drug information is sourced from the South Korean Ministry of Food and Drug Safety public datasets.</li>
          <li><strong>OpenFDA:</strong> International drug data is sourced from the U.S. Food and Drug Administration's public OpenFDA API.</li>
          <li><strong>Google AdSense (if enabled):</strong> May display contextual advertisements based on page content.</li>
          <li><strong>Google Analytics (if enabled):</strong> Provides anonymized usage statistics.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">5. How We Use Information</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          We use the information we collect strictly to: (a) provide pill identification results; (b) improve
          the accuracy and reliability of the Service; (c) analyze aggregate usage patterns; (d) prevent abuse
          and security threats; and (e) comply with legal obligations. We do not sell, rent, or trade your
          personal information to anyone, ever.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">6. Your Rights</h2>
        <p className="leading-relaxed text-[var(--text-primary)] mb-3">
          Depending on your jurisdiction, you may have the following rights:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-[var(--text-primary)]">
          <li>Right to access any personal data we hold about you</li>
          <li>Right to request correction or deletion of your data</li>
          <li>Right to object to processing</li>
          <li>Right to data portability</li>
          <li>Right to withdraw consent at any time</li>
          <li>Right to lodge a complaint with a supervisory authority (e.g., EU GDPR, California CCPA)</li>
        </ul>
        <p className="leading-relaxed text-[var(--text-primary)] mt-3">
          To exercise any of these rights, contact us at <a href="mailto:taeshinkim11@gmail.com" className="text-[var(--accent)] underline">taeshinkim11@gmail.com</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">7. Children's Privacy</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          PillScan is not directed at children under 13. We do not knowingly collect personal information from
          children. If you believe we have collected information from a child, please contact us so we can
          delete it.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">8. Data Security</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          PillScan transmits all data over HTTPS using industry-standard TLS encryption. While no online service
          can be 100% secure, we implement reasonable measures to protect against unauthorized access.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">9. Changes to This Policy</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          We may update this Privacy Policy from time to time. Material changes will be reflected in the "Last
          updated" date at the top of this page. Continued use of PillScan after changes constitutes acceptance
          of the updated policy.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">10. Contact Us</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          If you have any questions or concerns about this Privacy Policy, please contact us at{" "}
          <a href="mailto:taeshinkim11@gmail.com" className="text-[var(--accent)] underline">taeshinkim11@gmail.com</a>.
        </p>
      </section>
    </article>
  );
}

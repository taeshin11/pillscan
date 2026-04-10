import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — PillScan",
  description:
    "Terms of service for PillScan, the free AI-powered pill identification tool. Includes disclaimers, acceptable use, and limitation of liability.",
  keywords: ["pillscan terms", "terms of service", "pill identifier terms", "disclaimer"],
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service — PillScan",
    description: "Terms governing your use of PillScan.",
    url: "https://pillscan-ai.vercel.app/terms",
  },
};

export default function TermsPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-[var(--accent)] hover:underline">← Back to Home</Link>
      <h1 className="text-3xl sm:text-4xl font-bold mt-4 mb-2 text-[var(--text-primary)]">Terms of Service</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">Last updated: April 10, 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">1. Acceptance of Terms</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          By accessing or using PillScan ("the Service") at pillscan-ai.vercel.app, you agree to be bound by these
          Terms of Service ("Terms"). If you do not agree to these Terms, you must not use the Service. PillScan
          reserves the right to modify these Terms at any time, with changes effective immediately upon posting.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">2. Description of Service</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          PillScan is a free, web-based pill identification tool that uses artificial intelligence to recognize
          medications from photographs. The Service compares uploaded images against publicly available
          pharmaceutical databases and returns informational results. PillScan is provided as-is, without warranty
          of any kind.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">3. Medical Disclaimer</h2>
        <div className="card p-5 border-l-4 border-orange-400 bg-orange-50">
          <p className="leading-relaxed text-[var(--text-primary)] font-semibold mb-2">
            ⚠️ PillScan is NOT a medical device and does NOT provide medical advice.
          </p>
          <p className="leading-relaxed text-[var(--text-primary)]">
            The information provided by PillScan is for general informational purposes only and should never be
            used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice
            of a qualified pharmacist, physician, or other healthcare provider with any questions you may have
            regarding a medication. Never disregard professional medical advice or delay seeking it because of
            something you read on PillScan. If you think you may be experiencing a medical emergency, call your
            local emergency services immediately.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">4. Acceptable Use</h2>
        <p className="leading-relaxed text-[var(--text-primary)] mb-3">
          You agree to use PillScan only for lawful, personal, and non-commercial purposes. You may not:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-[var(--text-primary)]">
          <li>Use the Service to identify illegal drugs, controlled substances, or counterfeit medications for unlawful purposes</li>
          <li>Upload images that contain illegal content, malware, or copyrighted material you do not own</li>
          <li>Attempt to reverse-engineer, scrape, or extract data from the Service in bulk</li>
          <li>Use automated tools, bots, or scripts to access the Service without permission</li>
          <li>Overload our servers with excessive requests or denial-of-service attacks</li>
          <li>Misrepresent results from PillScan as professional medical advice to others</li>
          <li>Resell, sublicense, or commercially exploit the Service or its data</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">5. Limitation of Liability</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          To the maximum extent permitted by law, PillScan, its creators, contributors, and affiliates shall not
          be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out
          of or in connection with your use of the Service. This includes but is not limited to: incorrect
          identification results, missed identifications, adverse health effects from acting on results, data
          loss, service interruptions, or any other harm. Your sole remedy for dissatisfaction with the Service
          is to stop using it.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">6. No Warranty</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          PillScan is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or
          implied, including but not limited to warranties of merchantability, fitness for a particular purpose,
          accuracy, or non-infringement. We do not guarantee that the Service will be uninterrupted, error-free,
          or completely secure. Identification results may be incorrect, incomplete, or out of date.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">7. Intellectual Property</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          All trademarks, logos, and content on PillScan are the property of their respective owners. Drug
          information is sourced from public databases including the Korean MFDS and U.S. FDA OpenFDA, and is
          subject to those organizations' usage terms. The PillScan codebase, design, and original content are
          owned by SPINAI and contributors.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">8. Privacy</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          Your use of the Service is also governed by our <Link href="/privacy" className="text-[var(--accent)] underline">Privacy Policy</Link>,
          which is incorporated by reference into these Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">9. Termination</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          We reserve the right to suspend or terminate access to the Service at any time, with or without notice,
          for any reason, including but not limited to violation of these Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">10. Governing Law</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          These Terms shall be governed by and construed in accordance with the laws of the Republic of Korea,
          without regard to its conflict of law provisions. Any disputes arising under these Terms shall be
          resolved exclusively in the courts of the Republic of Korea.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">11. Contact</h2>
        <p className="leading-relaxed text-[var(--text-primary)]">
          For questions about these Terms, contact us at{" "}
          <a href="mailto:taeshinkim11@gmail.com" className="text-[var(--accent)] underline">taeshinkim11@gmail.com</a>.
        </p>
      </section>
    </article>
  );
}

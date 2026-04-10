import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About PillScan — Free AI Pill Identifier",
  description:
    "Learn about PillScan, the free AI-powered pill identification tool that helps patients, caregivers, and healthcare professionals identify medications instantly.",
  keywords: ["about pillscan", "AI pill identifier", "medication identification", "pill recognition tool", "free pill scanner"],
  openGraph: {
    title: "About PillScan — Free AI Pill Identifier",
    description: "Learn how PillScan uses AI vision and a database of 25,000+ medications to identify pills instantly.",
    url: "https://pillscan-ai.vercel.app/about",
    type: "website",
  },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose-content">
      <Link href="/" className="text-sm text-[var(--accent)] hover:underline">← Back to Home</Link>
      <h1 className="text-3xl sm:text-4xl font-bold mt-4 mb-6 text-[var(--text-primary)]">About PillScan</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">What is PillScan?</h2>
        <p className="text-[var(--text-primary)] leading-relaxed mb-4">
          PillScan is a free, AI-powered pill identification tool designed to help anyone instantly recognize
          medications using nothing more than a smartphone photo. Whether you've found a loose pill in a medicine
          cabinet, mixed up your daily prescriptions, or simply want to confirm what you're about to take,
          PillScan provides reliable identification powered by advanced computer vision and a comprehensive
          pharmaceutical database of more than 25,000 medications.
        </p>
        <p className="text-[var(--text-primary)] leading-relaxed">
          Built by a team passionate about patient safety and accessible healthcare technology, PillScan combines
          Google's Gemini multimodal AI with the official Korean Ministry of Food and Drug Safety (MFDS)
          medication database and the U.S. FDA OpenFDA dataset. Together, this gives users access to nearly 40,000
          drug records — without ever charging a fee, requiring an account, or storing personal health information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">The Problem We Solve</h2>
        <p className="text-[var(--text-primary)] leading-relaxed mb-4">
          Medication errors are one of the most common preventable harms in healthcare worldwide. According to the
          World Health Organization, the global cost of medication errors is estimated at $42 billion annually.
          A significant portion of these errors begins with a simple question: <em>"What pill is this?"</em>
        </p>
        <p className="text-[var(--text-primary)] leading-relaxed mb-4">
          Patients managing multiple prescriptions, caregivers looking after elderly relatives, parents finding
          unknown tablets in their homes, and travelers crossing borders with foreign medications all face the
          same challenge. Traditional pill identification requires either calling a pharmacist, paging through a
          drug reference book, or navigating clunky search interfaces with dozens of dropdowns.
        </p>
        <p className="text-[var(--text-primary)] leading-relaxed">
          PillScan removes that friction. Take a photo. Get an answer. It's that simple.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">Who Is PillScan For?</h2>
        <ul className="list-disc pl-6 space-y-2 text-[var(--text-primary)]">
          <li><strong>Patients</strong> managing chronic conditions or multiple prescriptions who need to verify their medications.</li>
          <li><strong>Caregivers and family members</strong> looking after elderly parents, children, or relatives with complex medication schedules.</li>
          <li><strong>Healthcare professionals</strong> seeking a quick second-check tool for unfamiliar tablets.</li>
          <li><strong>Pharmacists and pharmacy technicians</strong> who need a fast lookup tool during busy shifts.</li>
          <li><strong>Travelers</strong> who encounter foreign medications and need to understand what they are.</li>
          <li><strong>Parents</strong> who find a stray pill on the floor or in a child's belongings.</li>
          <li><strong>Researchers and students</strong> studying pharmacology or healthcare informatics.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">The Technology Behind PillScan</h2>
        <p className="text-[var(--text-primary)] leading-relaxed mb-4">
          PillScan uses a multi-stage identification pipeline designed for both accuracy and resilience:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-[var(--text-primary)]">
          <li>
            <strong>Client-side image preprocessing.</strong> Before your photo is even sent to our servers,
            JavaScript running in your browser automatically enhances contrast and applies a sharpening filter,
            making faint pill imprints far more readable.
          </li>
          <li>
            <strong>Multimodal AI vision analysis.</strong> The processed image is analyzed by Google's Gemini
            2.0 Flash model, which extracts the pill's shape, color, imprint text, and best-guess drug name.
            For multi-pill photos, each distinct pill type is identified and counted separately.
          </li>
          <li>
            <strong>Attribute-based database lookup.</strong> The extracted shape, color, and imprint are matched
            against 25,409 records from the official Korean MFDS pill identification database. Matches are
            scored by exactness, with imprint text receiving the highest weight.
          </li>
          <li>
            <strong>Detail enrichment.</strong> Confirmed matches are enriched with comprehensive drug information
            from the e약은요 (e-Drug Information) database, including indications, dosage, side effects,
            interactions, and storage instructions.
          </li>
          <li>
            <strong>International fallback.</strong> If no Korean match is found, PillScan searches an additional
            14,900 international drug records sourced from the U.S. FDA OpenFDA database, providing global coverage.
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">Our Commitment to Privacy</h2>
        <p className="text-[var(--text-primary)] leading-relaxed">
          PillScan does not require an account, does not store your photos, and does not share any personally
          identifiable information with third parties. Uploaded images are processed in memory and discarded
          immediately after analysis. Your search history is stored only in your own browser using localStorage —
          we never see it. For more details, please see our <Link href="/privacy" className="text-[var(--accent)] underline">Privacy Policy</Link>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">Important Medical Disclaimer</h2>
        <p className="text-[var(--text-primary)] leading-relaxed">
          PillScan is an informational tool, not a substitute for professional medical advice. While we strive
          for accuracy, AI-based identification can be wrong — especially when imprints are unclear, lighting
          is poor, or pills are inside packaging. Always verify any pill identification with a licensed
          pharmacist or healthcare provider before taking action. Never make medical decisions based solely
          on PillScan results.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">Get Started</h2>
        <p className="text-[var(--text-primary)] leading-relaxed">
          Ready to identify a pill? Visit our <Link href="/" className="text-[var(--accent)] underline">homepage</Link>{" "}
          to upload a photo, or read our <Link href="/how-to-use" className="text-[var(--accent)] underline">step-by-step guide</Link>{" "}
          for tips on getting the most accurate results.
        </p>
      </section>
    </article>
  );
}

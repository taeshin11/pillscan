import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Identify a Pill — PillScan Guide & FAQ",
  description:
    "Step-by-step guide to identifying any pill with PillScan. Learn how to take the best photo and get accurate results. Plus answers to the most common pill ID questions.",
  keywords: ["how to identify a pill", "pill identifier guide", "pill ID FAQ", "medication recognition", "pill scanner tutorial"],
  openGraph: {
    title: "How to Use PillScan — Step-by-Step Pill Identification Guide",
    description: "Learn how to identify any pill in 3 simple steps with PillScan's free AI tool.",
    url: "https://pillscan-ai.vercel.app/how-to-use",
    type: "article",
  },
  alternates: { canonical: "/how-to-use" },
};

const FAQ_DATA = [
  {
    q: "How accurate is PillScan compared to a pharmacist?",
    a: "PillScan combines Google Gemini's multimodal AI with the official Korean MFDS pill database (25,409 records) and the U.S. FDA OpenFDA dataset (14,900 records). When the imprint is clearly visible and the photo is well-lit, identification accuracy is comparable to commercial pill identifier tools. However, no automated system can match the judgment of a licensed pharmacist, and PillScan should never replace professional verification for medical decisions.",
  },
  {
    q: "Why does PillScan say 'Unknown' for some pills?",
    a: "There are several common reasons: (1) The pill imprint may be too faint, blurry, or hidden by packaging. (2) The pill may not be in the Korean MFDS or OpenFDA databases (e.g., compounded medications, very rare prescriptions, or non-pharmaceutical supplements). (3) Lighting conditions may obscure shape or color. Try retaking the photo from a closer angle, with better lighting, and with the pill removed from any blister pack or bag.",
  },
  {
    q: "Can PillScan identify multiple pills in a single photo?",
    a: "Yes. PillScan automatically detects all distinct pill types in your image and identifies each one separately. If you photograph six different pills together, you'll see six separate result tabs. The tool also counts how many pills of each type are visible — useful for verifying medication packs or organizing weekly pill organizers.",
  },
  {
    q: "Is PillScan free? Will it ever cost money?",
    a: "PillScan is completely free for individual use, with no account required, no usage limits, and no hidden fees. The service runs on a sustainable infrastructure that minimizes operating costs, and we have no plans to charge end users. In the future, we may offer a paid B2B API for healthcare organizations, but the consumer web app will remain free.",
  },
  {
    q: "What kind of pills can PillScan identify?",
    a: "PillScan can identify oral solid medications including tablets (round, oval, oblong, scored), capsules (hard and soft gel), and uniquely shaped pills (triangular, hexagonal, diamond-shaped, etc.). The database covers Korean prescription and over-the-counter medications, plus a large set of U.S. FDA-registered drugs. Liquids, injectables, patches, inhalers, creams, and herbal supplements are not currently supported.",
  },
  {
    q: "Does PillScan store my photos or personal information?",
    a: "No. Your photos are processed in memory and discarded immediately after analysis. PillScan does not require an account, does not track individual users, and does not share data with third parties. Your search history is stored only in your own browser (localStorage) and never transmitted to our servers. For complete details, see our Privacy Policy.",
  },
  {
    q: "Can I use PillScan on my phone, tablet, or desktop?",
    a: "Yes. PillScan is a fully responsive web application that works on any device with a modern browser — iPhone, Android, iPad, Windows PC, Mac, or Chromebook. On mobile devices, you can launch your camera directly from the app to take a fresh photo. On desktop, you can upload an existing image file or drag and drop it into the upload area.",
  },
  {
    q: "Why are imprint, shape, and color so important?",
    a: "These three attributes form the universal pharmaceutical identification standard used worldwide. The U.S. FDA, Korea's MFDS, and the European EMA all require manufacturers to register a unique combination of imprint code, color, and shape for every pill. By extracting these three features from your photo, PillScan can match against millions of registered medications with high specificity. That's why we always ask you to photograph the side with the clearest imprint.",
  },
  {
    q: "What should I do if I suspect a counterfeit or unknown pill?",
    a: "If you've found a pill you cannot identify and suspect it may be counterfeit, illegal, or harmful, do not consume it. Contact your local poison control center, pharmacist, or healthcare provider immediately. In the U.S., the Poison Help Line is 1-800-222-1222. PillScan is an informational tool only and cannot detect counterfeit pills, contamination, or dangerous substances.",
  },
  {
    q: "Can I search by typing the imprint instead of uploading a photo?",
    a: "Yes! Switch to the '🔍 Find by Shape' tab on the homepage. There you can manually enter the imprint text and select shape, color, and dosage form (tablet, hard capsule, soft capsule). This is especially useful if you can read the imprint with your eyes but the camera struggles to focus on small text.",
  },
];

export default function HowToUsePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_DATA.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <article className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-[var(--accent)] hover:underline">← Back to Home</Link>
        <h1 className="text-3xl sm:text-4xl font-bold mt-4 mb-2 text-[var(--text-primary)]">
          How to Identify a Pill with PillScan
        </h1>
        <p className="text-[var(--text-muted)] mb-8">
          A complete guide to using PillScan effectively and answers to the most common questions about pill identification.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">Three Simple Steps</h2>

          <div className="space-y-5">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold">1</div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Take or Upload a Clear Photo</h3>
              </div>
              <p className="text-[var(--text-primary)] leading-relaxed">
                On the PillScan homepage, click "📷 Use Camera" to open your phone's camera, or "📁 Upload File"
                to choose an existing image. For best results, place the pill on a plain, light-colored surface
                in good lighting. Remove the pill from any blister pack, paper sleeve, or plastic bag — the AI
                cannot read imprints through reflective packaging. If the pill has different markings on each side,
                photograph the side with the most visible text or numbers first.
              </p>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold">2</div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Click "Identify Pill"</h3>
              </div>
              <p className="text-[var(--text-primary)] leading-relaxed">
                Once your image is loaded, tap the "🔍 Identify Pill" button. PillScan will automatically apply
                client-side image enhancement (auto-contrast and sharpening) to make faint imprints more readable,
                then send the enhanced image to Google's Gemini AI for analysis. You'll see a live progress bar
                showing each stage: image preprocessing, AI vision analysis, database search, and result preparation.
                The entire process typically takes 3 to 8 seconds.
              </p>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold">3</div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Review the Results</h3>
              </div>
              <p className="text-[var(--text-primary)] leading-relaxed">
                PillScan displays a confidence score, the AI's best guess, and matching entries from the
                pharmaceutical database. For each match, you'll see the official drug name, manufacturer, indications,
                dosage, precautions, and side effects. If multiple pills were detected in a single photo, you can
                switch between them using the tabs at the top. If the confidence score is low, PillScan will prompt
                you to take a clearer photo of the side with visible text.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">Tips for Better Accuracy</h2>
          <ul className="list-disc pl-6 space-y-2 text-[var(--text-primary)]">
            <li>Use natural daylight or a bright white LED whenever possible.</li>
            <li>Place the pill on a contrasting background (e.g., a white pill on a dark surface).</li>
            <li>Get close enough to fill the frame with the pill, but stay within your camera's macro range.</li>
            <li>If your pill has imprints on both sides, take two separate photos and identify them separately.</li>
            <li>Avoid glare from glossy packaging — remove pills from blister packs whenever possible.</li>
            <li>If your phone has a "macro mode," enable it for very small pills.</li>
            <li>Wipe the pill clean of any dust, fingerprints, or residue before photographing.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_DATA.map((faq, i) => (
              <details key={i} className="card p-5">
                <summary className="font-semibold text-[var(--text-primary)] cursor-pointer">
                  {faq.q}
                </summary>
                <p className="mt-3 text-[var(--text-primary)] leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}

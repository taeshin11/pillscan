import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8 px-4 mt-12 bg-white/40">
      <div className="max-w-3xl mx-auto">
        {/* Top: links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">PillScan</h3>
            <ul className="space-y-1 text-[var(--text-muted)]">
              <li><Link href="/" className="hover:text-[var(--accent)]">Home</Link></li>
              <li><Link href="/about" className="hover:text-[var(--accent)]">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Help</h3>
            <ul className="space-y-1 text-[var(--text-muted)]">
              <li><Link href="/how-to-use" className="hover:text-[var(--accent)]">How to Use</Link></li>
              <li><Link href="/how-to-use" className="hover:text-[var(--accent)]">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Legal</h3>
            <ul className="space-y-1 text-[var(--text-muted)]">
              <li><Link href="/privacy" className="hover:text-[var(--accent)]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--accent)]">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Contact</h3>
            <ul className="space-y-1 text-[var(--text-muted)]">
              <li>
                <a href="mailto:taeshinkim11@gmail.com" className="hover:text-[var(--accent)]">
                  Feedback
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom: copyright + disclaimer */}
        <div className="pt-5 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div>
            © 2026 PillScan · Produced by{" "}
            <a
              href="https://www.spinai.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline font-medium"
            >
              SPINAI
            </a>
          </div>
          <div className="text-center opacity-70">
            ⚕️ Not a substitute for professional medical advice
          </div>
        </div>
      </div>
    </footer>
  );
}

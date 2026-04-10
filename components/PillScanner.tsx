"use client";

import { useState, useRef, useCallback } from "react";
import type { Locale } from "@/lib/translations";
import { translations } from "@/lib/translations";
import { preprocessImageClient } from "@/lib/imagePreprocess";
import ResultCard from "./ResultCard";

interface PillScannerProps {
  locale: Locale;
}

export default function PillScanner({ locale }: PillScannerProps) {
  const t = translations[locale];
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file || !image) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Client-side preprocessing: contrast + sharpen for better imprint reading
      const enhanced = await preprocessImageClient(image);

      // Convert enhanced dataURL back to File
      const blob = await (await fetch(enhanced)).blob();
      const enhancedFile = new File([blob], file.name, { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", enhancedFile);

      const res = await fetch("/api/identify", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message || "분석에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Upload Zone */}
      {!result && (
        <div
          className={`upload-zone mb-6 ${dragOver ? "border-[var(--accent)] bg-[var(--accent-light)]" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !image && fileInputRef.current?.click()}
        >
          {image ? (
            <div className="flex flex-col items-center gap-4">
              <img
                src={image}
                alt="pill preview"
                className="max-h-56 max-w-full rounded-xl object-contain shadow-md"
              />
              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border)] bg-white hover:bg-gray-50 transition-colors"
                >
                  ✕ {t.tryAgain}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                  disabled={loading}
                  className="px-6 py-2 rounded-xl text-sm font-semibold bg-[var(--accent)] text-white hover:bg-[#6a8880] transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t.analyzing}
                    </>
                  ) : (
                    <>🔍 {t.analyzeBtn}</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="text-5xl">💊</div>
              <div>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{t.uploadPrompt}</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">{t.uploadHint}</p>
              </div>
              {/* Photo guide */}
              <div className="w-full max-w-sm bg-[var(--accent-light)] rounded-xl p-3 text-left space-y-1.5">
                <p className="text-xs font-semibold text-[var(--accent)]">📸 정확한 식별을 위한 촬영 팁</p>
                <ul className="text-xs text-[var(--text-muted)] space-y-1 list-none">
                  <li>✓ 알약을 봉지에서 <strong>꺼내서</strong> 촬영</li>
                  <li>✓ 글씨/각인이 보이는 면을 <strong>가까이</strong> 촬영</li>
                  <li>✓ 앞·뒷면 모두 찍으면 정확도 UP</li>
                  <li>✓ 밝은 곳에서, 배경은 단색으로</li>
                </ul>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--accent)] text-white hover:bg-[#6a8880] transition-all"
                >
                  📷 {t.cameraBtn}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
                >
                  📁 {t.uploadBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Privacy note */}
      {!result && (
        <p className="text-center text-xs text-[var(--text-muted)] mb-2">
          🔒 {t.privacyNote}
        </p>
      )}

      {/* Result */}
      {result && (
        <ResultCard
          result={result}
          locale={locale}
          t={t}
          onReset={handleReset}
          onAddPhoto={() => {
            setResult(null);
            setImage(null);
            setFile(null);
            setTimeout(() => cameraInputRef.current?.click(), 100);
          }}
        />
      )}
    </div>
  );
}

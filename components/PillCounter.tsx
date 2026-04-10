"use client";

import { useState, useRef, useCallback } from "react";
import { preprocessImageClient } from "@/lib/imagePreprocess";
import { t, type Locale } from "@/lib/i18n";

export default function PillCounter({ locale }: { locale: Locale }) {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleCount = async () => {
    if (!file || !image) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const enhanced = await preprocessImageClient(image);
      const blob = await (await fetch(enhanced)).blob();
      const formData = new FormData();
      formData.append("image", new File([blob], file.name, { type: "image/jpeg" }));

      const res = await fetch("/api/count", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError(e.message || t(locale, "countFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setImage(null); setFile(null); setResult(null); setError(null); };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {!result && (
        <div
          className="upload-zone mb-6"
          onClick={() => !image && fileRef.current?.click()}
        >
          {image ? (
            <div className="flex flex-col items-center gap-4">
              <img src={image} alt="preview" className="max-h-56 max-w-full rounded-xl object-contain shadow-md" />
              <div className="flex gap-3">
                <button onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border)] bg-white">
                  {t(locale, "resetBack")}
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleCount(); }}
                  disabled={loading}
                  className="px-6 py-2 rounded-xl text-sm font-semibold bg-[var(--accent)] text-white disabled:opacity-60 flex items-center gap-2">
                  {loading ? (
                    <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t(locale, "countingBtn")}</>
                  ) : t(locale, "countBtn")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="text-5xl">🔢</div>
              <div className="text-center">
                <p className="text-lg font-semibold text-[var(--text-primary)]">{t(locale, "countTitle")}</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">{t(locale, "countSubtitle")}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--accent)] text-white">
                  {t(locale, "countCameraBtn")}
                </button>
                <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--accent)] text-[var(--accent)]">
                  {t(locale, "countUploadBtn")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">⚠️ {error}</div>
      )}

      {result && (
        <div className="result-section space-y-4">
          <div className="card p-6 text-center">
            <div className="text-6xl font-bold text-[var(--accent)] mb-2">{result.totalCount}</div>
            <div className="text-lg font-semibold text-[var(--text-primary)]">{t(locale, "totalCount")}</div>
          </div>

          {result.breakdown?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">{t(locale, "countDetails")}</h3>
              <div className="space-y-2">
                {result.breakdown.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <span className="text-sm text-[var(--text-primary)]">{item.description}</span>
                    <span className="text-lg font-bold text-[var(--accent)]">{t(locale, "countItems", { n: item.count })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {image && (
            <div className="card p-4">
              <img src={image} alt="counted" className="max-h-48 mx-auto rounded-xl object-contain" />
            </div>
          )}

          <button onClick={handleReset}
            className="w-full py-3 rounded-xl text-sm font-medium border border-[var(--border)] hover:bg-gray-50">
            {t(locale, "countAgain")}
          </button>
        </div>
      )}
    </div>
  );
}

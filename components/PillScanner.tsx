"use client";

import { useState, useRef, useCallback } from "react";
import type { Locale } from "@/lib/translations";
import { translations } from "@/lib/translations";
import { preprocessImageClient } from "@/lib/imagePreprocess";
import { saveToHistory } from "@/lib/history";
import ResultCard from "./ResultCard";
import LoadingProgress from "./LoadingProgress";

interface PillScannerProps {
  locale: Locale;
}

interface ImageSlot {
  file: File;
  dataUrl: string;
}

export default function PillScanner({ locale }: PillScannerProps) {
  const t = translations[locale];
  const [images, setImages] = useState<ImageSlot[]>([]); // up to 4 images (front, back, etc.)
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 4;

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!fileArr.length) return;
    setError(null);
    setResult(null);

    const remaining = MAX_IMAGES - images.length;
    const toAdd = fileArr.slice(0, remaining);

    Promise.all(
      toAdd.map(
        (f) =>
          new Promise<ImageSlot>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ file: f, dataUrl: e.target?.result as string });
            reader.readAsDataURL(f);
          })
      )
    ).then((newSlots) => {
      setImages((prev) => [...prev, ...newSlots]);
    });
  }, [images.length]);

  const handleRemove = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Preprocess all images
      const enhancedDataUrls = await Promise.all(
        images.map((slot) => preprocessImageClient(slot.dataUrl))
      );

      // Build a single FormData with all images
      const formData = new FormData();
      for (let i = 0; i < enhancedDataUrls.length; i++) {
        const blob = await (await fetch(enhancedDataUrls[i])).blob();
        formData.append("image", new File([blob], `pill_${i}.jpg`, { type: "image/jpeg" }));
      }

      const res = await fetch("/api/identify", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);

      saveToHistory({
        type: "photo",
        timestamp: Date.now(),
        thumbnail: enhancedDataUrls[0]?.slice(0, 50000),
        pills: data.pills?.map((p: any) => ({
          name: p.attrMatches?.[0]?.itemName || p.analysis.drugName || "Unknown",
          shape: p.analysis.shape,
          color: p.analysis.color,
          imprint: p.analysis.imprint,
        })) || [],
      });
    } catch (e: any) {
      setError(e.message || "분석에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImages([]);
    setResult(null);
    setError(null);
  };

  const canAddMore = images.length < MAX_IMAGES;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {!result && (
        <div
          className={`upload-zone mb-6 ${dragOver ? "border-[var(--accent)] bg-[var(--accent-light)]" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {images.length > 0 ? (
            <div className="flex flex-col items-center gap-4">
              {/* Image grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                {images.map((slot, i) => (
                  <div key={i} className="relative aspect-square">
                    <img
                      src={slot.dataUrl}
                      alt={`pill ${i + 1}`}
                      className="w-full h-full rounded-xl object-cover shadow-md"
                    />
                    <div className="absolute top-1 left-1 bg-[var(--accent)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {i === 0 ? "앞면" : i === 1 ? "뒷면" : `#${i + 1}`}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
                      className="absolute top-1 right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-xs hover:bg-red-50 hover:text-red-600 transition-colors shadow"
                      aria-label="remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Add more slot */}
                {canAddMore && (
                  <button
                    onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                    className="aspect-square rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all"
                  >
                    <span className="text-3xl">+</span>
                    <span className="text-[10px] mt-1">
                      {images.length === 1 ? "뒷면 추가" : "사진 추가"}
                    </span>
                  </button>
                )}
              </div>

              <p className="text-xs text-[var(--text-muted)] text-center">
                {images.length === 1 && "💡 뒷면도 추가하면 식별 정확도가 크게 올라갑니다"}
                {images.length > 1 && `${images.length}장 / 최대 ${MAX_IMAGES}장`}
              </p>

              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border)] bg-white hover:bg-gray-50 transition-colors"
                >
                  ✕ 전체 삭제
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-6 py-2 rounded-xl text-sm font-semibold bg-[var(--accent)] text-white hover:bg-[#6a8880] transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t.analyzing}
                    </>
                  ) : (
                    <>🔍 {t.analyzeBtn} ({images.length}장)</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center gap-4 py-4 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-5xl">💊</div>
              <div>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{t.uploadPrompt}</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">앞면 + 뒷면 동시 업로드 가능 (최대 4장)</p>
              </div>
              <div className="w-full max-w-sm bg-[var(--accent-light)] rounded-xl p-3 text-left space-y-1.5">
                <p className="text-xs font-semibold text-[var(--accent)]">📸 정확한 식별을 위한 촬영 팁</p>
                <ul className="text-xs text-[var(--text-muted)] space-y-1 list-none">
                  <li>✓ 알약을 봉지에서 <strong>꺼내서</strong> 촬영</li>
                  <li>✓ 글씨/각인이 보이는 면을 <strong>가까이</strong> 촬영</li>
                  <li>✓ <strong>앞면과 뒷면 모두</strong> 찍으면 정확도 UP</li>
                  <li>✓ 밝은 곳에서, 배경은 단색으로</li>
                </ul>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--accent)] text-white hover:bg-[#6a8880] transition-all"
                >
                  📷 카메라
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
                >
                  📁 파일 (여러장 가능)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* File inputs — both support multiple */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      <LoadingProgress active={loading} />

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {!result && images.length === 0 && (
        <p className="text-center text-xs text-[var(--text-muted)] mb-2">
          🔒 {t.privacyNote}
        </p>
      )}

      {result && (
        <ResultCard
          result={result}
          locale={locale}
          t={t}
          onReset={handleReset}
          onAddPhoto={() => {
            setResult(null);
            setImages([]);
            setTimeout(() => cameraInputRef.current?.click(), 100);
          }}
        />
      )}
    </div>
  );
}

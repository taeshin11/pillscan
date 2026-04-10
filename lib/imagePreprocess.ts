/**
 * Client-side image preprocessing optimized for pill imprint readability.
 *
 * Pipeline:
 *   1. Resize to max 2048px
 *   2. CLAHE (Contrast Limited Adaptive Histogram Equalization)
 *      — adaptive per-tile contrast that exposes embossed/engraved characters
 *   3. Sobel edge boost — accentuates character outlines
 *   4. Sharpening (unsharp mask)
 *
 * Returns a JPEG data URL.
 */

const TILE_SIZE = 64;       // CLAHE tile dimension
const CLIP_LIMIT = 2.5;     // CLAHE clip limit (higher = stronger contrast)
const EDGE_STRENGTH = 0.25; // 0-1, how much edge map to blend in

export function preprocessImageClient(imageDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

      // Resize to keep API payload reasonable
      const maxDim = 2048;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      // ── Step 1: Convert to grayscale-luma copy for CLAHE/edge ────
      const luma = new Uint8ClampedArray(w * h);
      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        // ITU-R BT.601 luma
        luma[j] = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) | 0;
      }

      // ── Step 2: CLAHE — adaptive histogram equalization ──────────
      const claheLuma = applyCLAHE(luma, w, h, TILE_SIZE, CLIP_LIMIT);

      // ── Step 3: Sobel edge map ───────────────────────────────────
      const edgeMap = applySobel(claheLuma, w, h);

      // ── Step 4: Blend back into RGB ──────────────────────────────
      // For each pixel: scale RGB by ratio of (CLAHE luma / original luma)
      // and add edge map as a darkening factor on outlines
      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        const origLuma = luma[j] || 1;
        const newLuma = claheLuma[j];
        const ratio = newLuma / origLuma;

        // Apply contrast ratio
        let r = data[i] * ratio;
        let g = data[i + 1] * ratio;
        let b = data[i + 2] * ratio;

        // Edge boost — darken pixels along strong edges
        const edge = edgeMap[j] / 255;
        const edgeFactor = 1 - edge * EDGE_STRENGTH;
        r *= edgeFactor;
        g *= edgeFactor;
        b *= edgeFactor;

        data[i]     = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }

      ctx.putImageData(imageData, 0, 0);

      // ── Step 5: Final sharpening pass (unsharp mask) ─────────────
      const finalData = ctx.getImageData(0, 0, w, h);
      const sharpened = sharpen(finalData.data, w, h);
      const out = ctx.createImageData(w, h);
      out.data.set(sharpened);
      ctx.putImageData(out, 0, 0);

      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.src = imageDataUrl;
  });
}

// ── CLAHE: Contrast Limited Adaptive Histogram Equalization ─────
function applyCLAHE(
  luma: Uint8ClampedArray,
  w: number,
  h: number,
  tileSize: number,
  clipLimit: number
): Uint8ClampedArray {
  const tilesX = Math.ceil(w / tileSize);
  const tilesY = Math.ceil(h / tileSize);

  // Compute lookup table per tile
  const tileLUTs: Uint8Array[][] = [];
  for (let ty = 0; ty < tilesY; ty++) {
    tileLUTs[ty] = [];
    for (let tx = 0; tx < tilesX; tx++) {
      const x0 = tx * tileSize;
      const y0 = ty * tileSize;
      const x1 = Math.min(x0 + tileSize, w);
      const y1 = Math.min(y0 + tileSize, h);

      // Histogram
      const hist = new Uint32Array(256);
      let count = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          hist[luma[y * w + x]]++;
          count++;
        }
      }

      // Clip histogram
      const clipPx = Math.max(1, (clipLimit * count) / 256);
      let excess = 0;
      for (let i = 0; i < 256; i++) {
        if (hist[i] > clipPx) {
          excess += hist[i] - clipPx;
          hist[i] = clipPx;
        }
      }
      // Redistribute excess
      const incr = excess / 256;
      for (let i = 0; i < 256; i++) hist[i] += incr;

      // CDF → LUT
      const lut = new Uint8Array(256);
      let cdf = 0;
      const total = count || 1;
      for (let i = 0; i < 256; i++) {
        cdf += hist[i];
        lut[i] = Math.round((cdf / total) * 255);
      }
      tileLUTs[ty][tx] = lut;
    }
  }

  // Bilinear interpolation between adjacent tile LUTs
  const out = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const txF = x / tileSize - 0.5;
      const tyF = y / tileSize - 0.5;
      const tx0 = Math.max(0, Math.floor(txF));
      const ty0 = Math.max(0, Math.floor(tyF));
      const tx1 = Math.min(tilesX - 1, tx0 + 1);
      const ty1 = Math.min(tilesY - 1, ty0 + 1);
      const fx = Math.max(0, Math.min(1, txF - tx0));
      const fy = Math.max(0, Math.min(1, tyF - ty0));

      const v = luma[y * w + x];
      const v00 = tileLUTs[ty0][tx0][v];
      const v01 = tileLUTs[ty0][tx1][v];
      const v10 = tileLUTs[ty1][tx0][v];
      const v11 = tileLUTs[ty1][tx1][v];

      const top = v00 * (1 - fx) + v01 * fx;
      const bot = v10 * (1 - fx) + v11 * fx;
      out[y * w + x] = top * (1 - fy) + bot * fy;
    }
  }
  return out;
}

// ── Sobel edge detector ─────────────────────────────────────────
function applySobel(luma: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx =
        -luma[i - w - 1] - 2 * luma[i - 1] - luma[i + w - 1] +
         luma[i - w + 1] + 2 * luma[i + 1] + luma[i + w + 1];
      const gy =
        -luma[i - w - 1] - 2 * luma[i - w] - luma[i - w + 1] +
         luma[i + w - 1] + 2 * luma[i + w] + luma[i + w + 1];
      const mag = Math.sqrt(gx * gx + gy * gy);
      out[i] = Math.min(255, mag);
    }
  }
  return out;
}

// ── Unsharp mask sharpening ─────────────────────────────────────
function sharpen(data: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data.length);
  out.set(data);
  // 3x3 kernel: [0,-1,0,-1,5,-1,0,-1,0]
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const i = (y * w + x) * 4 + c;
        const v =
          5 * data[i] -
          data[i - 4] - data[i + 4] -
          data[i - w * 4] - data[i + w * 4];
        out[i] = Math.max(0, Math.min(255, v));
      }
      out[(y * w + x) * 4 + 3] = 255;
    }
  }
  return out;
}

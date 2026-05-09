import sharp from "sharp";
import { prisma } from "@/lib/prisma";

// Default fallback used when no logo has been uploaded.
const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#4f46e5"/>
  <text x="256" y="340" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="320" fill="#ffffff">M</text>
</svg>`;

interface RenderOptions {
  size: number;
  /**
   * Square output where the logo is centered on a brand-color (or white) field.
   * Useful for apple-touch-icon since iOS doesn't auto-mask transparent edges.
   * Accepts a CSS color string or an {r,g,b,alpha} object.
   */
  background?: import("sharp").Color;
  /** Pad the logo so it doesn't touch the edges. 0-1 fraction of the canvas. */
  padding?: number;
}

async function getLogoUrl(): Promise<string | null> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "logo" } });
    return setting?.value || null;
  } catch {
    return null;
  }
}

async function fetchLogoBytes(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch {
    return null;
  }
}

export async function renderPwaIcon({ size, background, padding = 0.12 }: RenderOptions): Promise<Buffer> {
  const logoUrl = await getLogoUrl();

  // No logo set → render the default brand SVG to PNG at the requested size.
  if (!logoUrl) {
    return sharp(Buffer.from(DEFAULT_SVG)).resize(size, size).png().toBuffer();
  }

  const logoBytes = await fetchLogoBytes(logoUrl);
  if (!logoBytes) {
    // Logo URL unreachable — fall back to default rather than 500.
    return sharp(Buffer.from(DEFAULT_SVG)).resize(size, size).png().toBuffer();
  }

  const inner = Math.max(1, Math.round(size * (1 - padding * 2)));
  const resizedLogo = await sharp(logoBytes)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Compose onto a square canvas. White background gives iOS-safe contrast for
  // colored logos; the "any" purpose icons get a transparent canvas so they
  // can be masked into pill / circle shapes by the OS.
  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  return canvas
    .composite([{ input: resizedLogo, gravity: "center" }])
    .png()
    .toBuffer();
}

export const PWA_ICON_CACHE_HEADERS: Record<string, string> = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
};

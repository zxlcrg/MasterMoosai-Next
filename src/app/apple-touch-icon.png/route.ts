import { NextResponse } from "next/server";
import { renderPwaIcon, PWA_ICON_CACHE_HEADERS } from "@/lib/pwa-icon";

export const revalidate = 3600;

export async function GET() {
  // iOS doesn't auto-mask transparent edges → render on a white square.
  const png = await renderPwaIcon({
    size: 180,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
    padding: 0.1,
  });
  return new NextResponse(png as any, { headers: PWA_ICON_CACHE_HEADERS });
}

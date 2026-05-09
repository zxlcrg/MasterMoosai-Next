import { NextResponse } from "next/server";
import { renderPwaIcon, PWA_ICON_CACHE_HEADERS } from "@/lib/pwa-icon";

export const revalidate = 3600;

export async function GET() {
  const png = await renderPwaIcon({ size: 32, padding: 0.05 });
  return new NextResponse(png as any, { headers: PWA_ICON_CACHE_HEADERS });
}

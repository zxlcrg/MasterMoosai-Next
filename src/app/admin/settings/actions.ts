"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const KEYS = [
  "site_name",
  "site_tagline",
  "contact_email",
  "contact_phone",
  "address",
  "payment_instructions",
  "facebook_url",
  "instagram_url",
  "youtube_url",
] as const;

async function setSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

async function getSetting(key: string): Promise<string | null> {
  const s = await prisma.setting.findUnique({ where: { key } });
  return s?.value || null;
}

export async function updateSettings(formData: FormData) {
  for (const key of KEYS) {
    const value = (formData.get(key) as string) ?? "";
    await setSetting(key, value);
  }
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

export async function uploadLogo(formData: FormData) {
  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) return { error: "No file selected" };
  if (file.size > 2 * 1024 * 1024) return { error: "File must be under 2MB" };
  if (!file.type.startsWith("image/")) return { error: "File must be an image" };

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { error: "Logo upload requires BLOB_READ_WRITE_TOKEN env var (configure in Vercel)" };
  }

  // Remove old logo if present
  const existing = await getSetting("logo");
  if (existing) {
    try { await del(existing); } catch { /* ignore */ }
  }

  const ext = file.name.split(".").pop() || "png";
  const blob = await put(`logos/logo-${Date.now()}.${ext}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  await setSetting("logo", blob.url);
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  revalidatePwaIcons();
  return { success: "Logo uploaded" };
}

export async function removeLogo() {
  const existing = await getSetting("logo");
  if (existing) {
    try { await del(existing); } catch { /* ignore */ }
    await setSetting("logo", "");
  }
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  revalidatePwaIcons();
  return { success: "Logo removed" };
}

function revalidatePwaIcons() {
  for (const p of ["/icon-192.png", "/icon-512.png", "/apple-touch-icon.png", "/favicon-32.png"]) {
    revalidatePath(p);
  }
}

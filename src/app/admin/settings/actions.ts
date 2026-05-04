"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const KEYS = [
  "site_name",
  "site_tagline",
  "contact_email",
  "contact_phone",
  "address",
  "facebook_url",
  "instagram_url",
  "youtube_url",
] as const;

export async function updateSettings(formData: FormData) {
  for (const key of KEYS) {
    const value = (formData.get(key) as string) ?? "";
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

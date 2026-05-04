"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function updateUserRole(id: number, role: string) {
  const parsed = z.enum(["ADMIN", "TEACHER", "STUDENT"]).safeParse(role);
  if (!parsed.success) return { error: "Invalid role" };
  await prisma.user.update({ where: { id }, data: { role: parsed.data } });
  revalidatePath("/admin/users");
}

export async function updateUserStatus(id: number, status: string) {
  const parsed = z.enum(["ACTIVE", "INACTIVE"]).safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };
  await prisma.user.update({ where: { id }, data: { status: parsed.data } });
  revalidatePath("/admin/users");
}

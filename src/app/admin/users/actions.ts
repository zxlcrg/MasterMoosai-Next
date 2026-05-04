"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const baseSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
  // Teacher
  specialization: z.string().optional().or(z.literal("")),
  qualification: z.string().optional().or(z.literal("")),
  experienceYears: z.coerce.number().int().min(0).optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  // Student
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  guardianName: z.string().optional().or(z.literal("")),
  guardianPhone: z.string().optional().or(z.literal("")),
});

export async function createUser(formData: FormData) {
  const parsed = baseSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: formData.get("role"),
    specialization: formData.get("specialization"),
    qualification: formData.get("qualification"),
    experienceYears: formData.get("experienceYears"),
    bio: formData.get("bio"),
    dateOfBirth: formData.get("dateOfBirth"),
    gender: formData.get("gender"),
    address: formData.get("address"),
    guardianName: formData.get("guardianName"),
    guardianPhone: formData.get("guardianPhone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  if (data.role === "TEACHER" && !data.specialization) {
    return { error: "Specialization is required for teachers" };
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return { error: "Email already in use" };

  const hashed = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      password: hashed,
      role: data.role,
      ...(data.role === "TEACHER" && {
        teacher: {
          create: {
            specialization: data.specialization!,
            qualification: data.qualification || null,
            experienceYears: typeof data.experienceYears === "number" ? data.experienceYears : 0,
            bio: data.bio || null,
          },
        },
      }),
      ...(data.role === "STUDENT" && {
        student: {
          create: {
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            gender: data.gender ? (data.gender as any) : null,
            address: data.address || null,
            guardianName: data.guardianName || null,
            guardianPhone: data.guardianPhone || null,
          },
        },
      }),
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

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

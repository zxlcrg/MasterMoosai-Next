"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const teacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6).optional().or(z.literal("")),
  specialization: z.string().min(2),
  qualification: z.string().optional().or(z.literal("")),
  experienceYears: z.coerce.number().int().min(0).default(0),
  bio: z.string().optional().or(z.literal("")),
});

function parse(formData: FormData) {
  return teacherSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    specialization: formData.get("specialization"),
    qualification: formData.get("qualification"),
    experienceYears: formData.get("experienceYears"),
    bio: formData.get("bio"),
  });
}

export async function createTeacher(formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  if (!data.password) return { error: "Password is required for new teachers." };

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return { error: "Email already exists." };

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      password: await bcrypt.hash(data.password, 10),
      role: "TEACHER",
      teacher: {
        create: {
          specialization: data.specialization,
          qualification: data.qualification || null,
          experienceYears: data.experienceYears,
          bio: data.bio || null,
        },
      },
    },
  });

  revalidatePath("/admin/teachers");
  redirect("/admin/teachers");
}

export async function updateTeacher(id: number, formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) return { error: "Teacher not found." };

  await prisma.user.update({
    where: { id: teacher.userId },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      ...(data.password ? { password: await bcrypt.hash(data.password, 10) } : {}),
    },
  });

  await prisma.teacher.update({
    where: { id },
    data: {
      specialization: data.specialization,
      qualification: data.qualification || null,
      experienceYears: data.experienceYears,
      bio: data.bio || null,
    },
  });

  revalidatePath("/admin/teachers");
  redirect("/admin/teachers");
}

export async function deleteTeacher(id: number) {
  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) return { error: "Teacher not found." };

  await prisma.user.delete({ where: { id: teacher.userId } });
  revalidatePath("/admin/teachers");
}

export async function uploadTeacherAvatar(teacherId: number, formData: FormData) {
  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "No file selected" };
  if (file.size > 2 * 1024 * 1024) return { error: "Image must be under 2MB" };
  if (!file.type.startsWith("image/")) return { error: "File must be an image" };

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { error: "Avatar upload requires BLOB_READ_WRITE_TOKEN env var (configure in Vercel)" };
  }

  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId }, include: { user: true } });
  if (!teacher) return { error: "Teacher not found" };

  if (teacher.user.avatar) {
    try { await del(teacher.user.avatar); } catch { /* ignore */ }
  }

  const ext = file.name.split(".").pop() || "png";
  const blob = await put(`teachers/teacher-${teacherId}-${Date.now()}.${ext}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  await prisma.user.update({ where: { id: teacher.userId }, data: { avatar: blob.url } });

  revalidatePath("/admin/teachers");
  revalidatePath(`/admin/teachers/${teacherId}/edit`);
  revalidatePath("/", "layout");
  return { success: "Avatar uploaded" };
}

export async function removeTeacherAvatar(teacherId: number) {
  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId }, include: { user: true } });
  if (!teacher) return { error: "Teacher not found" };

  if (teacher.user.avatar) {
    try { await del(teacher.user.avatar); } catch { /* ignore */ }
    await prisma.user.update({ where: { id: teacher.userId }, data: { avatar: null } });
  }

  revalidatePath("/admin/teachers");
  revalidatePath(`/admin/teachers/${teacherId}/edit`);
  revalidatePath("/", "layout");
  return { success: "Avatar removed" };
}

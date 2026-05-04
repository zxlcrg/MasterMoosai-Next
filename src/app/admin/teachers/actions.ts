"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
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

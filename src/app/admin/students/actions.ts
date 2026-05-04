"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const studentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  guardianName: z.string().optional().or(z.literal("")),
  guardianPhone: z.string().optional().or(z.literal("")),
});

function parseFormData(formData: FormData) {
  return studentSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    dateOfBirth: formData.get("dateOfBirth"),
    gender: formData.get("gender"),
    address: formData.get("address"),
    guardianName: formData.get("guardianName"),
    guardianPhone: formData.get("guardianPhone"),
  });
}

export async function createStudent(formData: FormData) {
  const parsed = parseFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  if (!data.password) return { error: "Password is required for new students." };

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return { error: "Email already exists." };

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      password: hashedPassword,
      role: "STUDENT",
      student: {
        create: {
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender || null,
          address: data.address || null,
          guardianName: data.guardianName || null,
          guardianPhone: data.guardianPhone || null,
          enrollmentDate: new Date(),
        },
      },
    },
  });

  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function updateStudent(id: number, formData: FormData) {
  const parsed = parseFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const student = await prisma.student.findUnique({ where: { id }, include: { user: true } });
  if (!student) return { error: "Student not found." };

  await prisma.user.update({
    where: { id: student.userId },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      ...(data.password ? { password: await bcrypt.hash(data.password, 10) } : {}),
    },
  });

  await prisma.student.update({
    where: { id },
    data: {
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gender: data.gender || null,
      address: data.address || null,
      guardianName: data.guardianName || null,
      guardianPhone: data.guardianPhone || null,
    },
  });

  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function deleteStudent(id: number) {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return { error: "Student not found." };

  // Cascade delete via the user (Student has onDelete: Cascade on userId)
  await prisma.user.delete({ where: { id: student.userId } });

  revalidatePath("/admin/students");
}

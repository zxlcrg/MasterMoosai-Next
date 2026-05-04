"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const enrollmentSchema = z.object({
  studentId: z.coerce.number().int(),
  courseId: z.coerce.number().int(),
  status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "DROPPED"]).default("PENDING"),
});

export async function createEnrollment(formData: FormData) {
  const parsed = enrollmentSchema.safeParse({
    studentId: formData.get("studentId"),
    courseId: formData.get("courseId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const exists = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: parsed.data.studentId, courseId: parsed.data.courseId } },
  });
  if (exists) return { error: "This student is already enrolled in this course." };

  await prisma.enrollment.create({ data: parsed.data });
  revalidatePath("/admin/enrollments");
  redirect("/admin/enrollments");
}

export async function updateEnrollmentStatus(id: number, status: string) {
  const parsed = z.enum(["PENDING", "ACTIVE", "COMPLETED", "DROPPED"]).safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };

  const completedAt = parsed.data === "COMPLETED" ? new Date() : null;
  await prisma.enrollment.update({
    where: { id },
    data: { status: parsed.data, completedAt },
  });
  revalidatePath("/admin/enrollments");
}

export async function deleteEnrollment(id: number) {
  await prisma.enrollment.delete({ where: { id } });
  revalidatePath("/admin/enrollments");
}

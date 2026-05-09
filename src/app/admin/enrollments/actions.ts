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

const updateSchema = z.object({
  studentId: z.coerce.number().int(),
  courseId: z.coerce.number().int(),
  status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "DROPPED"]),
  enrolledAt: z.string().min(4),
  completedAt: z.string().optional().or(z.literal("")),
});

export async function updateEnrollment(id: number, formData: FormData) {
  const parsed = updateSchema.safeParse({
    studentId: formData.get("studentId"),
    courseId: formData.get("courseId"),
    status: formData.get("status"),
    enrolledAt: formData.get("enrolledAt"),
    completedAt: formData.get("completedAt"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const current = await prisma.enrollment.findUnique({
    where: { id },
    include: { _count: { select: { payments: true } } },
  });
  if (!current) return { error: "Enrollment not found." };

  const isReassigning =
    current.studentId !== data.studentId || current.courseId !== data.courseId;

  // Block reassignment if there are payments tied to this enrollment.
  if (isReassigning && current._count.payments > 0) {
    return {
      error: `Cannot change student or course on an enrollment with ${current._count.payments} payment(s). Delete the payments first or create a new enrollment.`,
    };
  }

  // Enforce unique (studentId, courseId) when reassigning.
  if (isReassigning) {
    const conflict = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: data.studentId, courseId: data.courseId } },
    });
    if (conflict && conflict.id !== id) {
      return { error: "This student is already enrolled in this course." };
    }
  }

  // If admin marks COMPLETED without specifying completedAt, set it to now.
  let completedAt: Date | null = null;
  if (data.completedAt) {
    completedAt = new Date(data.completedAt);
  } else if (data.status === "COMPLETED") {
    completedAt = current.completedAt || new Date();
  }

  await prisma.enrollment.update({
    where: { id },
    data: {
      studentId: data.studentId,
      courseId: data.courseId,
      status: data.status,
      enrolledAt: new Date(data.enrolledAt),
      completedAt,
    },
  });

  revalidatePath("/admin/enrollments");
  revalidatePath(`/admin/students/${data.studentId}/payments`);
  redirect("/admin/enrollments");
}

export async function deleteEnrollment(id: number) {
  await prisma.enrollment.delete({ where: { id } });
  revalidatePath("/admin/enrollments");
}

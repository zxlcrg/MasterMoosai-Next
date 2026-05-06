"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const courseSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  categoryId: z.coerce.number().int().optional().or(z.literal("")),
  mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
  durationWeeks: z.coerce.number().int().min(1),
  feeAmount: z.coerce.number().min(0),
  teacherId: z.coerce.number().int().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).default("DRAFT"),
  maxStudents: z.coerce.number().int().min(1).optional().or(z.literal("")),
});

function parse(formData: FormData) {
  return courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    mode: formData.get("mode"),
    durationWeeks: formData.get("durationWeeks"),
    feeAmount: formData.get("feeAmount"),
    teacherId: formData.get("teacherId"),
    status: formData.get("status"),
    maxStudents: formData.get("maxStudents"),
  });
}

export async function createCourse(formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const slug = slugify(data.title);
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) return { error: "A course with this title already exists." };

  await prisma.course.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      mode: data.mode,
      durationWeeks: data.durationWeeks,
      feeAmount: data.feeAmount,
      teacherId: data.teacherId ? Number(data.teacherId) : null,
      status: data.status,
      maxStudents: data.maxStudents ? Number(data.maxStudents) : null,
    },
  });

  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

export async function updateCourse(id: number, formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return { error: "Course not found." };

  const updateData: any = {
    title: data.title,
    description: data.description,
    categoryId: data.categoryId ? Number(data.categoryId) : null,
    mode: data.mode,
    durationWeeks: data.durationWeeks,
    feeAmount: data.feeAmount,
    teacherId: data.teacherId ? Number(data.teacherId) : null,
    status: data.status,
    maxStudents: data.maxStudents ? Number(data.maxStudents) : null,
  };

  if (course.title !== data.title) {
    updateData.slug = slugify(data.title);
  }

  await prisma.course.update({ where: { id }, data: updateData });

  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

export async function deleteCourse(id: number) {
  await prisma.course.delete({ where: { id } });
  revalidatePath("/admin/courses");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  courseId: z.coerce.number().int(),
  title: z.string().min(2),
  date: z.string().min(4),
  startTime: z.string().min(3),
  endTime: z.string().min(3),
  mode: z.enum(["ONLINE", "OFFLINE"]),
  location: z.string().optional().or(z.literal("")),
  meetingLink: z.string().optional().or(z.literal("")),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).default("SCHEDULED"),
});

function parse(formData: FormData) {
  return schema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    mode: formData.get("mode"),
    location: formData.get("location"),
    meetingLink: formData.get("meetingLink"),
    status: formData.get("status"),
  });
}

export async function createClass(formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  await prisma.classSession.create({
    data: {
      courseId: data.courseId,
      title: data.title,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      mode: data.mode,
      location: data.location || null,
      meetingLink: data.meetingLink || null,
      status: data.status,
    },
  });

  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function updateClass(id: number, formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  await prisma.classSession.update({
    where: { id },
    data: {
      courseId: data.courseId,
      title: data.title,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      mode: data.mode,
      location: data.location || null,
      meetingLink: data.meetingLink || null,
      status: data.status,
    },
  });

  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function deleteClass(id: number) {
  await prisma.classSession.delete({ where: { id } });
  revalidatePath("/admin/classes");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const schema = z.object({
  teacherId: z.coerce.number().int(),
  amount: z.coerce.number().min(0),
  paymentDate: z.string().min(4),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "ONLINE"]).default("CASH"),
  monthName: z.enum(MONTH_NAMES),
  year: z.coerce.number().int().min(2000).max(2100),
  status: z.enum(["PAID", "PENDING", "OVERDUE"]).default("PAID"),
  referenceNumber: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

function parse(formData: FormData) {
  return schema.safeParse({
    teacherId: formData.get("teacherId"),
    amount: formData.get("amount"),
    paymentDate: formData.get("paymentDate"),
    paymentMethod: formData.get("paymentMethod"),
    monthName: formData.get("monthName"),
    year: formData.get("year"),
    status: formData.get("status"),
    referenceNumber: formData.get("referenceNumber"),
    notes: formData.get("notes"),
  });
}

export async function createTeacherPayment(formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const monthLabel = `${data.monthName} ${data.year}`;

  const payment = await prisma.teacherPayment.create({
    data: {
      teacherId: data.teacherId,
      amount: data.amount,
      paymentDate: new Date(data.paymentDate),
      paymentMethod: data.paymentMethod,
      month: monthLabel,
      status: data.status,
      referenceNumber: data.referenceNumber || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/admin/teacher-payments");
  redirect(`/admin/teacher-payments/${payment.id}/invoice`);
}

export async function updateTeacherPayment(id: number, formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const current = await prisma.teacherPayment.findUnique({ where: { id } });
  if (!current) return { error: "Payment not found." };

  const monthLabel = `${data.monthName} ${data.year}`;

  await prisma.teacherPayment.update({
    where: { id },
    data: {
      teacherId: data.teacherId,
      amount: data.amount,
      paymentDate: new Date(data.paymentDate),
      paymentMethod: data.paymentMethod,
      month: monthLabel,
      status: data.status,
      referenceNumber: data.referenceNumber || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/admin/teacher-payments");
  revalidatePath(`/admin/teacher-payments/${id}/invoice`);
  revalidatePath(`/admin/teachers/${data.teacherId}/payments`);
  if (data.teacherId !== current.teacherId) {
    revalidatePath(`/admin/teachers/${current.teacherId}/payments`);
  }
  redirect("/admin/teacher-payments");
}

export async function deleteTeacherPayment(id: number) {
  await prisma.teacherPayment.delete({ where: { id } });
  revalidatePath("/admin/teacher-payments");
}

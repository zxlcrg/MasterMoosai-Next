"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  teacherId: z.coerce.number().int(),
  amount: z.coerce.number().min(0),
  paymentDate: z.string().min(4),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "ONLINE"]).default("CASH"),
  month: z.string().min(2),
  status: z.enum(["PAID", "PENDING", "OVERDUE"]).default("PAID"),
  referenceNumber: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export async function createTeacherPayment(formData: FormData) {
  const parsed = schema.safeParse({
    teacherId: formData.get("teacherId"),
    amount: formData.get("amount"),
    paymentDate: formData.get("paymentDate"),
    paymentMethod: formData.get("paymentMethod"),
    month: formData.get("month"),
    status: formData.get("status"),
    referenceNumber: formData.get("referenceNumber"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const payment = await prisma.teacherPayment.create({
    data: {
      teacherId: data.teacherId,
      amount: data.amount,
      paymentDate: new Date(data.paymentDate),
      paymentMethod: data.paymentMethod,
      month: data.month,
      status: data.status,
      referenceNumber: data.referenceNumber || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/admin/teacher-payments");
  redirect(`/admin/teacher-payments/${payment.id}/invoice`);
}

export async function deleteTeacherPayment(id: number) {
  await prisma.teacherPayment.delete({ where: { id } });
  revalidatePath("/admin/teacher-payments");
}

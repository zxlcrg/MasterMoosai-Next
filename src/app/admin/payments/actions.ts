"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const paymentSchema = z.object({
  enrollmentId: z.coerce.number().int(),
  amount: z.coerce.number().min(0),
  paymentDate: z.string().min(4),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "ONLINE"]).default("CASH"),
  month: z.string().min(2),
  status: z.enum(["PAID", "PENDING", "OVERDUE"]).default("PAID"),
  referenceNumber: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export async function createPayment(formData: FormData) {
  const parsed = paymentSchema.safeParse({
    enrollmentId: formData.get("enrollmentId"),
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

  const enrollment = await prisma.enrollment.findUnique({ where: { id: data.enrollmentId } });
  if (!enrollment) return { error: "Enrollment not found." };

  await prisma.payment.create({
    data: {
      enrollmentId: data.enrollmentId,
      studentId: enrollment.studentId,
      amount: data.amount,
      paymentDate: new Date(data.paymentDate),
      paymentMethod: data.paymentMethod,
      month: data.month,
      status: data.status,
      referenceNumber: data.referenceNumber || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/admin/payments");
  redirect("/admin/payments");
}

export async function deletePayment(id: number) {
  await prisma.payment.delete({ where: { id } });
  revalidatePath("/admin/payments");
}

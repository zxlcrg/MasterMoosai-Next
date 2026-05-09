"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({
  categoryId: z.coerce.number().int(),
  title: z.string().min(2),
  description: z.string().optional().or(z.literal("")),
  amount: z.coerce.number().min(0),
  expenseDate: z.string().min(4),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "ONLINE"]).default("CASH"),
  paidByName: z.string().optional().or(z.literal("")),
  referenceNumber: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

function parse(formData: FormData) {
  return schema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    expenseDate: formData.get("expenseDate"),
    paymentMethod: formData.get("paymentMethod"),
    paidByName: formData.get("paidByName"),
    referenceNumber: formData.get("referenceNumber"),
    notes: formData.get("notes"),
  });
}

async function requireAdminId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return parseInt(session.user.id as string, 10);
}

export async function createExpense(formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const createdById = await requireAdminId();

  await prisma.expense.create({
    data: {
      categoryId: data.categoryId,
      title: data.title,
      description: data.description || null,
      amount: data.amount,
      expenseDate: new Date(data.expenseDate),
      paymentMethod: data.paymentMethod,
      paidByName: data.paidByName || null,
      referenceNumber: data.referenceNumber || null,
      notes: data.notes || null,
      createdById,
    },
  });

  revalidatePath("/admin/expenses");
  redirect("/admin/expenses");
}

export async function updateExpense(id: number, formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const current = await prisma.expense.findUnique({ where: { id } });
  if (!current) return { error: "Expense not found." };

  await prisma.expense.update({
    where: { id },
    data: {
      categoryId: data.categoryId,
      title: data.title,
      description: data.description || null,
      amount: data.amount,
      expenseDate: new Date(data.expenseDate),
      paymentMethod: data.paymentMethod,
      paidByName: data.paidByName || null,
      referenceNumber: data.referenceNumber || null,
      notes: data.notes || null,
      // createdById intentionally not updated — preserves audit trail
    },
  });

  revalidatePath("/admin/expenses");
  redirect("/admin/expenses");
}

export async function deleteExpense(id: number) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/admin/expenses");
}

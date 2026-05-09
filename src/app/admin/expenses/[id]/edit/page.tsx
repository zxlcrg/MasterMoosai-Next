import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExpenseForm } from "../../ExpenseForm";
import { updateExpense } from "../../actions";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expenseId = parseInt(id, 10);

  const [expense, categories] = await Promise.all([
    prisma.expense.findUnique({ where: { id: expenseId } }),
    prisma.expenseCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, icon: true },
    }),
  ]);
  if (!expense) notFound();

  const updateAction = updateExpense.bind(null, expenseId);

  return (
    <div className="space-y-6">
      <Link href="/admin/expenses" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Expenses
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Edit Expense: {expense.title}</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <ExpenseForm
          categories={categories}
          initial={{
            categoryId: expense.categoryId,
            title: expense.title,
            description: expense.description,
            amount: Number(expense.amount),
            expenseDate: expense.expenseDate.toISOString().slice(0, 10),
            paymentMethod: expense.paymentMethod,
            paidByName: expense.paidByName,
            referenceNumber: expense.referenceNumber,
            notes: expense.notes,
          }}
          action={updateAction}
          submitLabel="Update Expense"
        />
      </div>
    </div>
  );
}

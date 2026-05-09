import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ExpenseForm } from "../ExpenseForm";
import { createExpense } from "../actions";

export default async function CreateExpensePage() {
  const categories = await prisma.expenseCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, icon: true },
  });

  return (
    <div className="space-y-6">
      <Link href="/admin/expenses" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Expenses
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Add Expense</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <ExpenseForm categories={categories} action={createExpense} submitLabel="Save Expense" />
      </div>
    </div>
  );
}

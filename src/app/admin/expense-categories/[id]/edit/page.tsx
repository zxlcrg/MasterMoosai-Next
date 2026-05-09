import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExpenseCategoryForm } from "../../ExpenseCategoryForm";
import { updateExpenseCategory } from "../../actions";

export default async function EditExpenseCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoryId = parseInt(id, 10);

  const category = await prisma.expenseCategory.findUnique({ where: { id: categoryId } });
  if (!category) notFound();

  const updateAction = updateExpenseCategory.bind(null, categoryId);

  return (
    <div className="space-y-6">
      <Link href="/admin/expense-categories" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Expense Categories
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Edit Category: {category.name}</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <ExpenseCategoryForm
          initial={{
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: category.color,
            sortOrder: category.sortOrder,
          }}
          action={updateAction}
          submitLabel="Update Category"
        />
      </div>
    </div>
  );
}

import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { Pagination } from "@/components/shared/Pagination";
import { DeleteExpenseButton } from "./DeleteExpenseButton";
import { formatCurrency, formatDate } from "@/lib/utils";

const PER_PAGE = 15;

interface Props {
  searchParams: Promise<{ search?: string; page?: string; categoryId?: string }>;
}

export default async function ExpensesPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || "";
  const page = parseInt(params.page || "1", 10);
  const filterCategoryId = params.categoryId ? parseInt(params.categoryId, 10) : undefined;

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { paidByName: { contains: search, mode: "insensitive" } },
      { referenceNumber: { contains: search, mode: "insensitive" } },
    ];
  }
  if (filterCategoryId) where.categoryId = filterCategoryId;

  const [expenses, total, totalSpent, categories] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: {
        category: true,
        createdBy: { select: { id: true, name: true } },
      },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      orderBy: { expenseDate: "desc" },
    }),
    prisma.expense.count({ where }),
    prisma.expense.aggregate({ where, _sum: { amount: true } }),
    prisma.expenseCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filterCategoryId ? "Filtered total: " : "Total spent: "}
            <span className="font-semibold text-red-700">
              {formatCurrency(Number(totalSpent._sum.amount || 0))}
            </span>
          </p>
        </div>
        <Link
          href="/admin/expenses/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-64">
            <SearchFilter placeholder="Search by title, paid by, or reference..." />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/expenses"
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                !filterCategoryId
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
              }`}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/admin/expenses?categoryId=${c.id}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                  filterCategoryId === c.id
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}
              >
                {c.icon ? `${c.icon} ` : ""}{c.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recorded By</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{e.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      {e.category.color && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: e.category.color }}
                        />
                      )}
                      <span className="text-gray-700">
                        {e.category.icon ? `${e.category.icon} ` : ""}
                        {e.category.name}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(Number(e.amount))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(e.expenseDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {e.paymentMethod.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.paidByName || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.createdBy.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/expenses/${e.id}/edit`}
                        title="Edit"
                        className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteExpenseButton
                        id={e.id}
                        label={`${e.title} — ${formatCurrency(Number(e.amount))}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    No expenses recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}

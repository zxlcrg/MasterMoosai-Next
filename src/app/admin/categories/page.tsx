import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeleteCategoryButton } from "./DeleteCategoryButton";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { courses: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Course Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Group courses for filtering on the public site</p>
        </div>
        <Link href="/admin/categories/create" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm">
          <Plus className="w-4 h-4" /> Add Category
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courses</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.sortOrder}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {c.color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />}
                      <span className="text-sm font-medium text-gray-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{c.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">{c.description || <span className="text-gray-300">—</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c._count.courses}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/categories/${c.id}/edit`} title="Edit" className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteCategoryButton id={c.id} name={c.name} courseCount={c._count.courses} />
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No categories yet. Add one to start grouping courses.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

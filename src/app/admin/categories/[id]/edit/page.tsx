import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "../../CategoryForm";
import { updateCategory } from "../../actions";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoryId = parseInt(id, 10);

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) notFound();

  const updateAction = updateCategory.bind(null, categoryId);

  return (
    <div className="space-y-6">
      <Link href="/admin/categories" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Categories
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Edit Category: {category.name}</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <CategoryForm
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

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CategoryForm } from "../CategoryForm";
import { createCategory } from "../actions";

export default function CreateCategoryPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/categories" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Categories
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Add Category</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <CategoryForm action={createCategory} submitLabel="Create Category" />
      </div>
    </div>
  );
}

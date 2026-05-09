import Link from "next/link";

interface Props {
  initial?: {
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    sortOrder: number;
  };
  action: (formData: FormData) => Promise<{ error: string } | void>;
  submitLabel: string;
}

export function ExpenseCategoryForm({ initial, action, submitLabel }: Props) {
  return (
    <form action={action as any} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
        <input
          name="name"
          type="text"
          defaultValue={initial?.name}
          required
          placeholder="e.g. Rent, Utilities, Salaries"
          className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
        <p className="text-xs text-gray-400 mt-1">A URL-friendly slug is generated automatically.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initial?.description || ""}
          placeholder="Notes about what falls under this category"
          className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
          <input
            name="sortOrder"
            type="number"
            min="0"
            defaultValue={initial?.sortOrder ?? 0}
            className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon <span className="text-gray-400">(emoji)</span></label>
          <input
            name="icon"
            type="text"
            defaultValue={initial?.icon || ""}
            placeholder="🏠 or 💡"
            className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
          <input
            name="color"
            type="text"
            defaultValue={initial?.color || ""}
            placeholder="#ef4444"
            className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
        <Link href="/admin/expense-categories" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</Link>
        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">{submitLabel}</button>
      </div>
    </form>
  );
}

import Link from "next/link";

interface Category {
  id: number;
  name: string;
  icon: string | null;
}

interface Props {
  categories: Category[];
  initial?: {
    categoryId: number;
    title: string;
    description: string | null;
    amount: number;
    expenseDate: string; // YYYY-MM-DD
    paymentMethod: "CASH" | "BANK_TRANSFER" | "ONLINE";
    paidByName: string | null;
    referenceNumber: string | null;
    notes: string | null;
  };
  action: (formData: FormData) => Promise<{ error: string } | void>;
  submitLabel: string;
}

export function ExpenseForm({ categories, initial, action, submitLabel }: Props) {
  const todayDate = new Date().toISOString().slice(0, 10);

  return (
    <form action={action as any} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
          <select
            name="categoryId"
            required
            defaultValue={initial?.categoryId ?? ""}
            className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">— Select category —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ""}{c.name}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              No categories yet.{" "}
              <Link href="/admin/expense-categories/create" className="underline">Create one</Link> first.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
          <input
            name="title"
            type="text"
            required
            defaultValue={initial?.title}
            placeholder="e.g. May office rent"
            className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (BDT) *</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={initial?.amount}
            className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
          <input
            name="expenseDate"
            type="date"
            required
            defaultValue={initial?.expenseDate || todayDate}
            className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Method</label>
          <select
            name="paymentMethod"
            defaultValue={initial?.paymentMethod || "CASH"}
            className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="ONLINE">Online</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Paid By <span className="text-gray-400">(name of person / vendor)</span>
          </label>
          <input
            name="paidByName"
            type="text"
            defaultValue={initial?.paidByName || ""}
            placeholder="e.g. Karim Bhai, Office, ABC Suppliers"
            className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Reference # <span className="text-gray-400">(optional)</span>
          </label>
          <input
            name="referenceNumber"
            type="text"
            defaultValue={initial?.referenceNumber || ""}
            className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={initial?.description || ""}
          className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Notes <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={initial?.notes || ""}
          className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
        <Link href="/admin/expenses" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</Link>
        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">{submitLabel}</button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deletePayment } from "./actions";

export function DeletePaymentButton({ id, label }: { id: number; label: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    try {
      await deletePayment(id);
      toast.success("Payment deleted.");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete.");
    }
    setOpen(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} title="Delete" className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
        <Trash2 className="w-4 h-4" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Payment</h3>
            <p className="text-sm text-gray-500 mb-6">Delete payment <span className="font-semibold">{label}</span>? This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

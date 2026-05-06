"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface Teacher {
  id: number;
  user: { name: string };
  specialization: string;
}

interface Category {
  id: number;
  name: string;
}

interface Props {
  initial?: {
    title: string;
    description: string;
    categoryId: number | null;
    mode: string;
    durationWeeks: number;
    feeAmount: number;
    teacherId: number | null;
    status: string;
    maxStudents: number | null;
  };
  teachers: Teacher[];
  categories: Category[];
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  submitLabel: string;
}

export function CourseForm({ initial, teachers, categories, action, submitLabel }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await action(formData);
    setLoading(false);
    if (result?.error) toast.error(result.error);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <input name="title" type="text" required defaultValue={initial?.title} className="mt-1 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description *</label>
          <textarea name="description" rows={4} required defaultValue={initial?.description} className="mt-1 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select name="categoryId" defaultValue={initial?.categoryId ?? ""} className="mt-1 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border">
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              No categories yet. <Link href="/admin/categories/create" className="underline">Add one</Link>.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mode *</label>
          <select name="mode" required defaultValue={initial?.mode || ""} className="mt-1 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border">
            <option value="">Select</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (weeks) *</label>
          <input name="durationWeeks" type="number" min="1" required defaultValue={initial?.durationWeeks} className="mt-1 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fee Amount (BDT) *</label>
          <input name="feeAmount" type="number" min="0" step="0.01" required defaultValue={Number(initial?.feeAmount || 0)} className="mt-1 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Teacher</label>
          <select name="teacherId" defaultValue={initial?.teacherId || ""} className="mt-1 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border">
            <option value="">None</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.user.name} ({t.specialization})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Students</label>
          <input name="maxStudents" type="number" min="1" defaultValue={initial?.maxStudents || ""} className="mt-1 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select name="status" defaultValue={initial?.status || "DRAFT"} className="mt-1 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border">
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Link href="/admin/courses" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</Link>
        <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

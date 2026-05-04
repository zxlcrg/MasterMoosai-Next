"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface StudentFormProps {
  initial?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    address: string | null;
    guardianName: string | null;
    guardianPhone: string | null;
  };
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  submitLabel: string;
}

export function StudentForm({ initial, action, submitLabel }: StudentFormProps) {
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
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            name="name"
            type="text"
            required
            defaultValue={initial?.name}
            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input
            name="email"
            type="email"
            required
            defaultValue={initial?.email}
            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            name="phone"
            type="text"
            defaultValue={initial?.phone || ""}
            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password {initial ? "(leave blank to keep)" : "*"}
          </label>
          <input
            name="password"
            type="password"
            required={!initial}
            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            name="dateOfBirth"
            type="date"
            defaultValue={initial?.dateOfBirth ? new Date(initial.dateOfBirth).toISOString().split("T")[0] : ""}
            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            name="gender"
            defaultValue={initial?.gender || ""}
            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
          >
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            name="address"
            rows={2}
            defaultValue={initial?.address || ""}
            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Guardian Name</label>
          <input
            name="guardianName"
            type="text"
            defaultValue={initial?.guardianName || ""}
            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Guardian Phone</label>
          <input
            name="guardianPhone"
            type="text"
            defaultValue={initial?.guardianPhone || ""}
            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Link
          href="/admin/students"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

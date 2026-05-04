"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  initial: { name: string; email: string; phone: string };
  action: (formData: FormData) => Promise<{ error?: string; success?: string }>;
}

export function ProfileForm({ initial, action }: Props) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    start(async () => {
      const result = await action(formData);
      if (result?.error) toast.error(result.error);
      else if (result?.success) { toast.success(result.success); router.refresh(); }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input name="name" type="text" defaultValue={initial.name} required className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input name="email" type="email" defaultValue={initial.email} required className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone <span className="text-gray-400">(optional)</span></label>
        <input name="phone" type="tel" defaultValue={initial.phone} className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
      </div>
      <div className="flex justify-end pt-3 border-t border-gray-100">
        <button type="submit" disabled={pending} className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {pending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useTransition, useRef } from "react";
import { toast } from "sonner";

interface Props {
  action: (formData: FormData) => Promise<{ error?: string; success?: string }>;
}

export function PasswordForm({ action }: Props) {
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    start(async () => {
      const result = await action(formData);
      if (result?.error) toast.error(result.error);
      else if (result?.success) { toast.success(result.success); formRef.current?.reset(); }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
        <input name="currentPassword" type="password" required className="block w-full max-w-md rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password <span className="text-gray-400">(min 6 characters)</span></label>
        <input name="newPassword" type="password" minLength={6} required className="block w-full max-w-md rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
      </div>
      <div className="flex justify-end pt-3 border-t border-gray-100">
        <button type="submit" disabled={pending} className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {pending ? "Updating..." : "Change Password"}
        </button>
      </div>
    </form>
  );
}

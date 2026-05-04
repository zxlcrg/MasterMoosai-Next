"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateEnrollmentStatus } from "./actions";

const STATUSES = ["PENDING", "ACTIVE", "COMPLETED", "DROPPED"] as const;

const COLOR: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  DROPPED: "bg-red-50 text-red-700 border-red-200",
};

export function EnrollmentStatusSelect({ id, value }: { id: number; value: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          const result = await updateEnrollmentStatus(id, e.target.value);
          if (result?.error) toast.error(result.error);
          else { toast.success("Status updated"); router.refresh(); }
        })
      }
      className={`text-xs font-medium px-2 py-1 rounded-md border ${COLOR[value] || "bg-gray-100 text-gray-700"} focus:ring-2 focus:ring-indigo-500 cursor-pointer`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

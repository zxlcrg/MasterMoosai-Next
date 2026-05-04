"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateUserRole, updateUserStatus } from "./actions";

const ROLE_COLOR: Record<string, string> = {
  ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
  TEACHER: "bg-blue-50 text-blue-700 border-blue-200",
  STUDENT: "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  INACTIVE: "bg-red-50 text-red-700 border-red-200",
};

export function UserRoleSelect({ id, value }: { id: number; value: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          const r = await updateUserRole(id, e.target.value);
          if (r?.error) toast.error(r.error);
          else { toast.success("Role updated"); router.refresh(); }
        })
      }
      className={`text-xs font-medium px-2 py-1 rounded-md border ${ROLE_COLOR[value]} focus:ring-2 focus:ring-indigo-500 cursor-pointer`}
    >
      <option value="ADMIN">ADMIN</option>
      <option value="TEACHER">TEACHER</option>
      <option value="STUDENT">STUDENT</option>
    </select>
  );
}

export function UserStatusSelect({ id, value }: { id: number; value: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          const r = await updateUserStatus(id, e.target.value);
          if (r?.error) toast.error(r.error);
          else { toast.success("Status updated"); router.refresh(); }
        })
      }
      className={`text-xs font-medium px-2 py-1 rounded-md border ${STATUS_COLOR[value]} focus:ring-2 focus:ring-indigo-500 cursor-pointer`}
    >
      <option value="ACTIVE">ACTIVE</option>
      <option value="INACTIVE">INACTIVE</option>
    </select>
  );
}

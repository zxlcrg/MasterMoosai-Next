import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createUser } from "../actions";
import { CreateUserForm } from "./CreateUserForm";

export default function CreateUserPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Users
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Add User</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <CreateUserForm action={createUser} />
      </div>
    </div>
  );
}

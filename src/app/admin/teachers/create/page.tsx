import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TeacherForm } from "../TeacherForm";
import { createTeacher } from "../actions";

export default function CreateTeacherPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/teachers" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Teachers
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Add Teacher</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <TeacherForm action={createTeacher} submitLabel="Create Teacher" />
      </div>
    </div>
  );
}

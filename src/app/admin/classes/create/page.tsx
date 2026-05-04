import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ClassForm } from "../ClassForm";
import { createClass } from "../actions";

export default async function CreateClassPage() {
  const courses = await prisma.course.findMany({
    where: { status: "ACTIVE" },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div className="space-y-6">
      <Link href="/admin/classes" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Classes
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Schedule Class Session</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <ClassForm courses={courses} action={createClass} submitLabel="Schedule Class" />
      </div>
    </div>
  );
}

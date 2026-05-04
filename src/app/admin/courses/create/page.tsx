import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CourseForm } from "../CourseForm";
import { createCourse } from "../actions";

export default async function CreateCoursePage() {
  const teachers = await prisma.teacher.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="space-y-6">
      <Link href="/admin/courses" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Courses
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Add New Course</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <CourseForm
          teachers={teachers.map((t) => ({ id: t.id, user: { name: t.user.name }, specialization: t.specialization }))}
          action={createCourse}
          submitLabel="Create Course"
        />
      </div>
    </div>
  );
}

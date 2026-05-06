import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseForm } from "../../CourseForm";
import { updateCourse } from "../../actions";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const courseId = parseInt(id, 10);

  const [course, teachers, categories] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.teacher.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  if (!course) notFound();

  const updateAction = updateCourse.bind(null, courseId);

  return (
    <div className="space-y-6">
      <Link href="/admin/courses" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Courses
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Edit Course: {course.title}</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <CourseForm
          initial={{
            title: course.title,
            description: course.description,
            categoryId: course.categoryId,
            mode: course.mode,
            durationWeeks: course.durationWeeks,
            feeAmount: Number(course.feeAmount),
            teacherId: course.teacherId,
            status: course.status,
            maxStudents: course.maxStudents,
          }}
          teachers={teachers.map((t) => ({ id: t.id, user: { name: t.user.name }, specialization: t.specialization }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          action={updateAction}
          submitLabel="Update Course"
        />
      </div>
    </div>
  );
}

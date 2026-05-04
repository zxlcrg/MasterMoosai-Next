import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClassForm } from "../../ClassForm";
import { updateClass } from "../../actions";

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const classId = parseInt(id, 10);

  const [classSession, courses] = await Promise.all([
    prisma.classSession.findUnique({ where: { id: classId } }),
    prisma.course.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  if (!classSession) notFound();

  const updateAction = updateClass.bind(null, classId);

  return (
    <div className="space-y-6">
      <Link href="/admin/classes" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Classes
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Edit Class: {classSession.title}</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <ClassForm
          initial={{
            courseId: classSession.courseId,
            title: classSession.title,
            date: classSession.date,
            startTime: classSession.startTime,
            endTime: classSession.endTime,
            mode: classSession.mode,
            location: classSession.location,
            meetingLink: classSession.meetingLink,
            status: classSession.status,
          }}
          courses={courses}
          action={updateAction}
          submitLabel="Update Class"
        />
      </div>
    </div>
  );
}

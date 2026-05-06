import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeacherForm } from "../../TeacherForm";
import { AvatarUploader } from "../../AvatarUploader";
import { updateTeacher, uploadTeacherAvatar, removeTeacherAvatar } from "../../actions";

export default async function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teacherId = parseInt(id, 10);

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: { user: true },
  });

  if (!teacher) notFound();

  const updateAction = updateTeacher.bind(null, teacherId);

  return (
    <div className="space-y-6">
      <Link href="/admin/teachers" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Teachers
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Edit Teacher: {teacher.user.name}</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Photo</h2>
        <AvatarUploader
          teacherId={teacherId}
          name={teacher.user.name}
          currentAvatar={teacher.user.avatar}
          uploadAction={uploadTeacherAvatar}
          removeAction={removeTeacherAvatar}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <TeacherForm
          initial={{
            name: teacher.user.name,
            email: teacher.user.email,
            phone: teacher.user.phone,
            specialization: teacher.specialization,
            qualification: teacher.qualification,
            experienceYears: teacher.experienceYears,
            bio: teacher.bio,
          }}
          action={updateAction}
          submitLabel="Update Teacher"
        />
      </div>
    </div>
  );
}

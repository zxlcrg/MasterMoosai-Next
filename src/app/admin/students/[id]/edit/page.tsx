import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentForm } from "../../StudentForm";
import { updateStudent } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: Props) {
  const { id } = await params;
  const studentId = parseInt(id, 10);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true },
  });

  if (!student) notFound();

  const updateAction = updateStudent.bind(null, studentId);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/students"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Students
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Edit Student: {student.user.name}</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <StudentForm
          initial={{
            id: student.id,
            name: student.user.name,
            email: student.user.email,
            phone: student.user.phone,
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            address: student.address,
            guardianName: student.guardianName,
            guardianPhone: student.guardianPhone,
          }}
          action={updateAction}
          submitLabel="Update Student"
        />
      </div>
    </div>
  );
}

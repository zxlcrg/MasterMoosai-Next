import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { Pagination } from "@/components/shared/Pagination";
import { DeleteEnrollmentButton } from "./DeleteEnrollmentButton";
import { EnrollmentStatusSelect } from "./EnrollmentStatusSelect";
import { formatDate } from "@/lib/utils";

const PER_PAGE = 15;

interface Props {
  searchParams: Promise<{ search?: string; page?: string; status?: string }>;
}

export default async function EnrollmentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || "";
  const status = params.status || "";
  const page = parseInt(params.page || "1", 10);

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { student: { user: { name: { contains: search, mode: "insensitive" } } } },
      { student: { user: { email: { contains: search, mode: "insensitive" } } } },
      { course: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      include: { student: { include: { user: true } }, course: true },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 font-sans">Enrollments</h1>
        <Link href="/admin/enrollments/create" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm">
          <Plus className="w-4 h-4" /> New Enrollment
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5">
          <SearchFilter placeholder="Search by student name, email, or course..." />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled On</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enrollments.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{e.student.user.name}</div>
                    <div className="text-xs text-gray-500">{e.student.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{e.course.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(e.enrolledAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EnrollmentStatusSelect id={e.id} value={e.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/enrollments/${e.id}/edit`}
                        title="Edit"
                        className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteEnrollmentButton id={e.id} label={`${e.student.user.name} → ${e.course.title}`} />
                    </div>
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No enrollments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}

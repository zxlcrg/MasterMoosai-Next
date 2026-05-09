import Link from "next/link";
import { Plus, Pencil, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { Pagination } from "@/components/shared/Pagination";
import { DeleteTeacherButton } from "./DeleteTeacherButton";

const PER_PAGE = 15;

interface Props {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function TeachersPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || "";
  const page = parseInt(params.page || "1", 10);

  const where = search
    ? {
        OR: [
          { user: { name: { contains: search, mode: "insensitive" as const } } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
          { specialization: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      include: { user: true, _count: { select: { courses: true } } },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.teacher.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 font-sans">Teachers</h1>
        <Link href="/admin/teachers/create" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm">
          <Plus className="w-4 h-4" /> Add Teacher
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5">
          <SearchFilter placeholder="Search by name, email, or specialization..." />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {t.user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.user.avatar} alt={t.user.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{t.user.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{t.user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.specialization}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t._count.courses}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.experienceYears} yrs</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/teachers/${t.id}/payments`} title="Payment history" className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                        <Wallet className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/teachers/${t.id}/edit`} title="Edit" className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteTeacherButton id={t.id} name={t.user.name} />
                    </div>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No teachers found.</td></tr>
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

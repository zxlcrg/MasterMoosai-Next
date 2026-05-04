import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Pagination } from "@/components/shared/Pagination";
import { DeleteClassButton } from "./DeleteClassButton";
import { formatDate } from "@/lib/utils";

const PER_PAGE = 15;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function ClassesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const [classes, total] = await Promise.all([
    prisma.classSession.findMany({
      include: { course: true, _count: { select: { attendances: true } } },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    }),
    prisma.classSession.count(),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      SCHEDULED: "bg-blue-50 text-blue-700",
      COMPLETED: "bg-green-50 text-green-700",
      CANCELLED: "bg-red-50 text-red-700",
    };
    return map[s] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 font-sans">Class Sessions</h1>
        <Link href="/admin/classes/create" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm">
          <Plus className="w-4 h-4" /> Schedule Class
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.course.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{formatDate(c.date)}</div>
                    <div className="text-xs text-gray-400">{c.startTime} – {c.endTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.mode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c._count.attendances}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(c.status)}`}>{c.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/classes/${c.id}/edit`} title="Edit" className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteClassButton id={c.id} title={c.title} />
                    </div>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No class sessions scheduled.</td></tr>
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

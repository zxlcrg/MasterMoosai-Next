import { prisma } from "@/lib/prisma";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { Pagination } from "@/components/shared/Pagination";
import { UserRoleSelect, UserStatusSelect } from "./UserControls";
import { formatDate } from "@/lib/utils";

const PER_PAGE = 20;

interface Props {
  searchParams: Promise<{ search?: string; page?: string; role?: string }>;
}

export default async function UsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || "";
  const role = params.role || "";
  const page = parseInt(params.page || "1", 10);

  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-sans">Users & Roles</h1>
        <p className="text-sm text-gray-500 mt-1">Manage user accounts, roles, and access status</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5">
          <SearchFilter placeholder="Search by name or email..." />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.phone || <span className="text-gray-300">—</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><UserRoleSelect id={u.id} value={u.role} /></td>
                  <td className="px-6 py-4 whitespace-nowrap"><UserStatusSelect id={u.id} value={u.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No users found.</td></tr>
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

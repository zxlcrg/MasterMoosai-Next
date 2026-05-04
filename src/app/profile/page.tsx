import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, User as UserIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./ProfileForm";
import { PasswordForm } from "./PasswordForm";
import { updateProfile, changePassword } from "./actions";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = parseInt(session.user.id as string, 10);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  const dashboardLink =
    user.role === "ADMIN" ? "/admin/dashboard" :
    user.role === "TEACHER" ? "/teacher/dashboard" :
    "/student/dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href={dashboardLink} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>

        <div className="space-y-6">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{user.name.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-sans">{user.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500">{user.email}</span>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{user.role}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${user.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{user.status}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Member since {formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Profile info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
            </div>
            <ProfileForm
              initial={{ name: user.name, email: user.email, phone: user.phone || "" }}
              action={updateProfile}
            />
          </div>

          {/* Password */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Change Password</h2>
            <PasswordForm action={changePassword} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { auth } from "@/lib/auth";

export default async function TeacherDashboard() {
  const session = await auth();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Teacher Dashboard</h1>
      <p className="text-gray-600">Welcome, {session?.user?.name}</p>
      <p className="text-sm text-gray-500 mt-4">Teacher panel features coming soon.</p>
    </div>
  );
}

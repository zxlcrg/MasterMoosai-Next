import { auth } from "@/lib/auth";

export default async function StudentDashboard() {
  const session = await auth();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      <p className="text-gray-600">Welcome, {session?.user?.name}</p>
      <p className="text-sm text-gray-500 mt-4">Student panel features coming soon.</p>
    </div>
  );
}

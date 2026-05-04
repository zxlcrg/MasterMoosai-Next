import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { status: "ACTIVE" },
    include: { teacher: { include: { user: true } } },
  });

  return (
    <section className="py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-dark font-sans mb-4">Our Courses</h1>
          <p className="text-gray-warm">Discover expert-led courses designed to unlock your potential.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover-card">
              <div className={`h-2 ${c.category === "ART" ? "bg-pink-500" : "bg-blue-500"}`}></div>
              <div className="p-6">
                <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${c.category === "ART" ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600"}`}>
                  {c.category}
                </span>
                <h3 className="font-sans text-lg font-bold text-dark mt-3 mb-2">{c.title}</h3>
                <p className="text-sm text-gray-warm line-clamp-2 mb-4">{c.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-dark">{formatCurrency(Number(c.feeAmount))}</span>
                  <span className="text-xs text-gray-warm">{c.durationWeeks} weeks</span>
                </div>
                <Link href={`/courses/${c.slug}`} className="mt-4 block text-center py-2.5 px-4 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

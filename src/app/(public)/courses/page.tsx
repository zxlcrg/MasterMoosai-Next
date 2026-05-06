import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function CoursesPage({ searchParams }: Props) {
  const params = await searchParams;
  const categorySlug = params.category;

  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
      where: {
        status: "ACTIVE",
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      include: { teacher: { include: { user: true } }, category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  const activeCategory = categorySlug ? categories.find((c) => c.slug === categorySlug) : null;

  return (
    <section className="py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-dark font-sans mb-4">
            {activeCategory ? activeCategory.name + " Courses" : "Our Courses"}
          </h1>
          <p className="text-gray-warm">
            {activeCategory?.description || "Discover expert-led courses designed to unlock your potential."}
          </p>
        </div>

        {/* Category filter chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <Link
              href="/courses"
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                !categorySlug ? "bg-primary text-white" : "bg-white text-gray-warm hover:bg-gray-100"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/courses?category=${cat.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  categorySlug === cat.slug ? "bg-primary text-white" : "bg-white text-gray-warm hover:bg-gray-100"
                }`}
                style={categorySlug === cat.slug && cat.color ? { backgroundColor: cat.color } : undefined}
              >
                {cat.icon ? `${cat.icon} ` : ""}{cat.name}
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((c) => {
            const accent = c.category?.color || "#6366f1";
            return (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover-card">
                <div className="h-2" style={{ backgroundColor: accent }}></div>
                <div className="p-6">
                  {c.category && (
                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full" style={{ backgroundColor: accent + "20", color: accent }}>
                      {c.category.icon ? `${c.category.icon} ` : ""}{c.category.name}
                    </span>
                  )}
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
            );
          })}
        </div>

        {courses.length === 0 && (
          <p className="text-center text-gray-warm py-12">
            {activeCategory ? `No courses in ${activeCategory.name} yet.` : "No active courses yet."}
          </p>
        )}
      </div>
    </section>
  );
}

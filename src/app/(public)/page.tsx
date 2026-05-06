import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

async function getHomeData() {
  const [studentCount, teacherCount, courseCount, featuredCourses] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.course.count({ where: { status: "ACTIVE" } }),
    prisma.course.findMany({
      where: { status: "ACTIVE" },
      include: { teacher: { include: { user: true } }, category: true },
      take: 6,
    }),
  ]);
  return {
    stats: { students: studentCount, teachers: teacherCount, courses: courseCount },
    featuredCourses,
  };
}

export default async function HomePage() {
  const { stats, featuredCourses } = await getHomeData();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark via-[#16213e] to-secondary py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium mb-6 backdrop-blur">
                <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
                Welcome to Mastermoosai
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white font-sans leading-tight mb-6">
                Learn <span className="text-primary">Art</span> &amp; <span className="text-primary">Technology</span> from the Best
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg font-body">
                Join our community of creative minds and tech innovators. Expert-led courses in painting, design, and software development.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/courses" className="inline-flex items-center px-7 py-3.5 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition shadow-lg shadow-primary/30 text-sm">
                  Explore Courses
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link href="/register" className="inline-flex items-center px-7 py-3.5 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition text-sm">
                  Register Free
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                    <div className="text-3xl font-extrabold text-white font-sans">{stats.students}+</div>
                    <div className="text-gray-400 text-sm mt-1">Active Students</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                    <div className="text-3xl font-extrabold text-primary font-sans">{stats.courses}</div>
                    <div className="text-gray-400 text-sm mt-1">Expert Courses</div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                    <div className="text-3xl font-extrabold text-white font-sans">{stats.teachers}</div>
                    <div className="text-gray-400 text-sm mt-1">Pro Instructors</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6">
                    <div className="text-3xl font-extrabold text-white font-sans">100%</div>
                    <div className="text-white/70 text-sm mt-1">Hands-on Learning</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Featured</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark font-sans mt-2">Popular Courses</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => {
              const accent = course.category?.color || "#ec4899";
              return (
              <div key={course.id} className="hover-card bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="h-3 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}dd)` }}></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    {course.category ? (
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ backgroundColor: accent + "20", color: accent }}>
                        {course.category.icon ? `${course.category.icon} ` : ""}{course.category.name}
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-500">Uncategorized</span>
                    )}
                    <span className="text-xs font-medium text-gray-500 capitalize bg-gray-100 px-3 py-1 rounded-full">{course.mode.toLowerCase()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-dark font-sans mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description}</p>
                  <div className="flex items-center mb-4">
                    {course.teacher?.user?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.teacher.user.avatar} alt={course.teacher.user.name} className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-100" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-secondary mr-2">
                        {course.teacher?.user?.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-dark">{course.teacher?.user?.name || "TBA"}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xl font-extrabold text-primary font-sans">{formatCurrency(Number(course.feeAmount))}</span>
                    <span className="text-xs text-gray-500">{course.durationWeeks} weeks</span>
                  </div>
                  <Link href={`/courses/${course.slug}`} className="mt-4 block text-center py-2.5 px-4 bg-pink-50 text-primary text-sm font-semibold rounded-full hover:bg-primary hover:text-white transition">
                    View Details
                  </Link>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-sans mb-4">Ready to Start Your Journey?</h2>
          <p className="text-white/80 mb-8 font-body text-lg">Join thousands of students already learning with us.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="inline-flex items-center px-8 py-4 bg-white text-primary font-bold rounded-full hover:shadow-xl transition text-sm">Register Now - It's Free</Link>
            <Link href="/courses" className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition text-sm">Browse Courses</Link>
          </div>
        </div>
      </section>
    </>
  );
}

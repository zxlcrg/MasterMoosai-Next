import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Users, Award, Calendar, MapPin, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      teacher: { include: { user: true } },
      category: true,
      _count: { select: { enrollments: true, classSessions: true, materials: true } },
    },
  });

  if (!course || course.status !== "ACTIVE") notFound();

  const session = await auth();
  const isStudent = session?.user?.role === "STUDENT";
  const userId = session?.user?.id ? parseInt(session.user.id as string, 10) : null;

  // Check if already enrolled
  let alreadyEnrolled = false;
  if (isStudent && userId) {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (student) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
      });
      alreadyEnrolled = !!enrollment;
    }
  }

  const accent = course.category?.color || "#ec4899";
  const seats = course.maxStudents ? `${course._count.enrollments}/${course.maxStudents}` : `${course._count.enrollments}`;
  const seatsLeft = course.maxStudents ? course.maxStudents - course._count.enrollments : null;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero */}
      <section className="relative overflow-hidden py-16" style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}05)` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/courses" className="inline-flex items-center text-sm text-gray-warm hover:text-dark transition mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" /> All Courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {course.category && (
                <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4" style={{ backgroundColor: accent + "20", color: accent }}>
                  {course.category.icon ? `${course.category.icon} ` : ""}{course.category.name}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-dark font-sans mb-4 leading-tight">{course.title}</h1>
              <p className="text-lg text-gray-warm leading-relaxed mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-warm">
                  <Clock className="w-4 h-4" style={{ color: accent }} />
                  <span><strong className="text-dark">{course.durationWeeks}</strong> weeks</span>
                </div>
                <div className="flex items-center gap-2 text-gray-warm">
                  <Users className="w-4 h-4" style={{ color: accent }} />
                  <span><strong className="text-dark">{seats}</strong> enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-gray-warm">
                  <MapPin className="w-4 h-4" style={{ color: accent }} />
                  <span className="capitalize"><strong className="text-dark">{course.mode.toLowerCase()}</strong></span>
                </div>
                {course._count.classSessions > 0 && (
                  <div className="flex items-center gap-2 text-gray-warm">
                    <Calendar className="w-4 h-4" style={{ color: accent }} />
                    <span><strong className="text-dark">{course._count.classSessions}</strong> sessions</span>
                  </div>
                )}
              </div>
            </div>

            {/* Enroll card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <div className="text-3xl font-extrabold text-dark font-sans mb-1">{formatCurrency(Number(course.feeAmount))}</div>
                <p className="text-xs text-gray-warm mb-6">Total course fee</p>

                {alreadyEnrolled ? (
                  <Link href="/student/dashboard" className="block w-full text-center py-3 px-4 bg-green-50 text-green-700 font-semibold rounded-full">
                    ✓ You are enrolled
                  </Link>
                ) : seatsLeft !== null && seatsLeft <= 0 ? (
                  <button disabled className="block w-full text-center py-3 px-4 bg-gray-100 text-gray-400 font-semibold rounded-full cursor-not-allowed">
                    Class Full
                  </button>
                ) : !session?.user ? (
                  <Link href="/register" className="block w-full text-center py-3 px-4 text-white font-semibold rounded-full transition" style={{ backgroundColor: accent }}>
                    Register to Enroll
                  </Link>
                ) : isStudent ? (
                  <Link href={`/student/courses/${course.slug}`} className="block w-full text-center py-3 px-4 text-white font-semibold rounded-full transition" style={{ backgroundColor: accent }}>
                    Enroll Now
                  </Link>
                ) : (
                  <p className="text-sm text-gray-warm text-center py-2">Only students can enroll. <Link href="/login" className="text-primary underline">Switch account</Link></p>
                )}

                {seatsLeft !== null && seatsLeft > 0 && seatsLeft <= 5 && (
                  <p className="text-xs text-amber-600 text-center mt-2">Only {seatsLeft} seats left!</p>
                )}

                <div className="border-t border-gray-100 mt-6 pt-6 space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-warm">Duration</span><span className="font-medium text-dark">{course.durationWeeks} weeks</span></div>
                  <div className="flex justify-between"><span className="text-gray-warm">Mode</span><span className="font-medium text-dark capitalize">{course.mode.toLowerCase()}</span></div>
                  {course.maxStudents && <div className="flex justify-between"><span className="text-gray-warm">Class size</span><span className="font-medium text-dark">Max {course.maxStudents}</span></div>}
                  {course._count.materials > 0 && <div className="flex justify-between"><span className="text-gray-warm">Materials</span><span className="font-medium text-dark">{course._count.materials}</span></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor */}
      {course.teacher && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-sm p-8 max-w-3xl">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-warm mb-4">Your Instructor</h2>
              <div className="flex items-start gap-5">
                {course.teacher.user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.teacher.user.avatar} alt={course.teacher.user.name} className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: accent }} />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: accent }}>
                    {course.teacher.user.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-dark font-sans">{course.teacher.user.name}</h3>
                  <p className="text-sm text-gray-warm">{course.teacher.specialization}</p>
                  {course.teacher.qualification && <p className="text-xs text-gray-warm mt-1 flex items-center gap-1"><Award className="w-3 h-3" />{course.teacher.qualification}</p>}
                  {course.teacher.experienceYears > 0 && <p className="text-xs text-gray-warm mt-1">{course.teacher.experienceYears} years of experience</p>}
                  {course.teacher.bio && <p className="text-sm text-gray-warm mt-3 leading-relaxed">{course.teacher.bio}</p>}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-dark font-sans mb-3">Have questions about this course?</h2>
          <p className="text-gray-warm mb-6">Our team is happy to help you choose the right path.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-dark text-white font-semibold rounded-full hover:bg-dark/90 transition text-sm">
            Contact Us <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

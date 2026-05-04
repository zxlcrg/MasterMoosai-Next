import { prisma } from "@/lib/prisma";

export default async function InstructorsPage() {
  const teachers = await prisma.teacher.findMany({
    include: { user: true, _count: { select: { courses: true } } },
  });

  return (
    <section className="py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-dark font-sans text-center mb-12">Our Instructors</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teachers.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm p-8 text-center hover-card">
              <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white">
                {t.user.name.charAt(0)}
              </div>
              <h3 className="font-sans text-xl font-bold text-dark mb-2">{t.user.name}</h3>
              <span className="inline-block text-xs font-bold uppercase px-4 py-1.5 rounded-full bg-secondary-light text-secondary mb-3">
                {t.specialization}
              </span>
              <p className="text-sm text-gray-warm">{t.experienceYears} yrs experience · {t._count.courses} courses</p>
              {t.bio && <p className="text-sm text-gray-warm mt-3 line-clamp-3">{t.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

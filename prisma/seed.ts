import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const password = await bcrypt.hash("password", 10);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@mims.test" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@mims.test",
      password,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✓ Admin created:", admin.email);

  // Teachers
  const teacherData = [
    { name: "Sarah Johnson", email: "sarah.johnson@mims.test", spec: "Art", qualification: "Master's in Fine Arts", years: 12 },
    { name: "Michael Chen", email: "michael.chen@mims.test", spec: "Software Development", qualification: "BSc Computer Science", years: 16 },
    { name: "Priya Patel", email: "priya.patel@mims.test", spec: "Graphic Design", qualification: "Bachelor's in Design", years: 15 },
  ];

  const teachers = [];
  for (const t of teacherData) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        name: t.name,
        email: t.email,
        password,
        role: "TEACHER",
        status: "ACTIVE",
        teacher: {
          create: {
            specialization: t.spec,
            qualification: t.qualification,
            experienceYears: t.years,
            bio: `Experienced ${t.spec} instructor with ${t.years} years of teaching expertise.`,
          },
        },
      },
      include: { teacher: true },
    });
    if (user.teacher) teachers.push(user.teacher);
  }
  console.log(`✓ ${teachers.length} teachers created`);

  // Courses
  const courseData = [
    { teacherIdx: 0, title: "Introduction to Oil Painting", category: "ART" as const, mode: "OFFLINE" as const, weeks: 12, fee: 20000 },
    { teacherIdx: 0, title: "Watercolor Techniques", category: "ART" as const, mode: "HYBRID" as const, weeks: 8, fee: 5000 },
    { teacherIdx: 1, title: "Web Development with Laravel", category: "SOFTWARE" as const, mode: "OFFLINE" as const, weeks: 16, fee: 20000 },
    { teacherIdx: 1, title: "JavaScript Full Stack", category: "SOFTWARE" as const, mode: "HYBRID" as const, weeks: 12, fee: 5000 },
    { teacherIdx: 2, title: "UI/UX Design Fundamentals", category: "SOFTWARE" as const, mode: "OFFLINE" as const, weeks: 10, fee: 10000 },
    { teacherIdx: 2, title: "Digital Illustration Masterclass", category: "ART" as const, mode: "ONLINE" as const, weeks: 8, fee: 8000 },
  ];

  const courses = [];
  for (const c of courseData) {
    const slug = c.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    const course = await prisma.course.upsert({
      where: { slug },
      update: {},
      create: {
        title: c.title,
        slug,
        description: `Comprehensive ${c.title.toLowerCase()} course designed for students at all levels. Learn from industry experts with hands-on practical projects.`,
        category: c.category,
        mode: c.mode,
        durationWeeks: c.weeks,
        feeAmount: c.fee,
        teacherId: teachers[c.teacherIdx].id,
        status: "ACTIVE",
        maxStudents: 30,
      },
    });
    courses.push(course);
  }
  console.log(`✓ ${courses.length} courses created`);

  // Students
  const studentData = [
    "Audreanne Lang", "Richmond Bernhard", "Mayra Spencer", "Camryn Graham", "Hanna Langworth",
    "Ronny Cummings", "Jeremy Rippin", "Isobel McDermott", "Patricia Schaefer", "Elias Bernier",
  ];

  const students = [];
  for (let i = 0; i < studentData.length; i++) {
    const name = studentData[i];
    const email = name.toLowerCase().replace(/\s+/g, ".") + "@mims.test";
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name,
        email,
        password,
        phone: `+880 1${Math.floor(100000000 + Math.random() * 900000000)}`,
        role: "STUDENT",
        status: "ACTIVE",
        student: {
          create: {
            gender: i % 2 === 0 ? "MALE" : "FEMALE",
            address: "Dhaka, Bangladesh",
          },
        },
      },
      include: { student: true },
    });
    if (user.student) students.push(user.student);
  }
  console.log(`✓ ${students.length} students created`);

  // Enrollments
  let enrollmentCount = 0;
  for (const student of students) {
    const numCourses = 1 + Math.floor(Math.random() * 3);
    const shuffled = [...courses].sort(() => Math.random() - 0.5).slice(0, numCourses);
    for (const course of shuffled) {
      try {
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            courseId: course.id,
            status: "ACTIVE",
            enrolledAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
          },
        });
        enrollmentCount++;
      } catch {
        // skip duplicates
      }
    }
  }
  console.log(`✓ ${enrollmentCount} enrollments created`);

  // Settings
  const defaultSettings = [
    { key: "institute_name", value: "Mastermoosai Institute" },
    { key: "institute_subtitle", value: "Training Institute" },
    { key: "contact_email", value: "info@mastermoosai.com" },
    { key: "contact_phone", value: "+880 1777-027856" },
    { key: "address", value: "Dhaka, Bangladesh" },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`✓ ${defaultSettings.length} settings created`);

  console.log("\n✅ Seeding complete!");
  console.log("   Admin login: admin@mims.test / password");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getSettings() {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value || "";
  return {
    instituteName: map.site_name || map.institute_name || "Mastermoosai",
    subtitle: map.site_tagline || map.institute_subtitle || "Training Institute",
    contactEmail: map.contact_email || "info@mastermoosai.com",
    contactPhone: map.contact_phone || "+880 1234-567890",
    address: map.address || "Dhaka, Bangladesh",
    logo: map.logo || "",
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const settings = await getSettings();

  const dashboardLink = session?.user?.role === "ADMIN"
    ? "/admin/dashboard"
    : session?.user?.role === "TEACHER"
    ? "/teacher/dashboard"
    : "/student/dashboard";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <div className="bg-dark text-white text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>📧 {settings.contactEmail}</span>
            <span>📞 {settings.contactPhone}</span>
          </div>
          <div className="flex items-center space-x-3">
            <a href="#" className="hover:text-primary transition">Facebook</a>
            <a href="#" className="hover:text-primary transition">Instagram</a>
            <a href="#" className="hover:text-primary transition">YouTube</a>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex items-center space-x-2">
              {settings.logo ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.logo} alt={settings.instituteName} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
              )}
              <div>
                <span className="text-xl font-bold text-dark font-sans">{settings.instituteName}</span>
                <span className="block text-[10px] text-gray-warm -mt-1 tracking-wider uppercase">{settings.subtitle}</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-sm font-semibold text-dark hover:text-primary transition">Home</Link>
              <Link href="/about" className="text-sm font-semibold text-dark hover:text-primary transition">About</Link>
              <Link href="/courses" className="text-sm font-semibold text-dark hover:text-primary transition">Courses</Link>
              <Link href="/instructors" className="text-sm font-semibold text-dark hover:text-primary transition">Instructors</Link>
              <Link href="/contact" className="text-sm font-semibold text-dark hover:text-primary transition">Contact</Link>
            </div>

            <div className="flex items-center space-x-3">
              {session?.user ? (
                <Link href={dashboardLink} className="inline-flex items-center px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition shadow-md shadow-primary/25">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-semibold text-dark hover:text-primary transition hidden sm:inline">Sign In</Link>
                  <Link href="/register" className="inline-flex items-center px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition shadow-md shadow-primary/25">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                {settings.logo ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={settings.logo} alt={settings.instituteName} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                )}
                <span className="text-xl font-bold font-sans">{settings.instituteName}</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering students with practical skills in art and technology through expert-led instruction.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold font-sans mb-4">Quick Links</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-primary transition">About Us</Link></li>
                <li><Link href="/courses" className="hover:text-primary transition">Courses</Link></li>
                <li><Link href="/instructors" className="hover:text-primary transition">Instructors</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold font-sans mb-4">Categories</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/courses?category=art" className="hover:text-primary transition">Art &amp; Design</Link></li>
                <li><Link href="/courses?category=software" className="hover:text-primary transition">Software Development</Link></li>
                <li><Link href="/register" className="hover:text-primary transition">Student Registration</Link></li>
                <li><Link href="/login" className="hover:text-primary transition">Student Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold font-sans mb-4">Contact Us</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>📍 {settings.address}</li>
                <li>📞 {settings.contactPhone}</li>
                <li>📧 {settings.contactEmail}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} {settings.instituteName}. All rights reserved.</p>
            <div className="flex space-x-6 mt-3 sm:mt-0">
              <a href="#" className="text-gray-500 text-sm hover:text-primary transition">Privacy Policy</a>
              <a href="#" className="text-gray-500 text-sm hover:text-primary transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

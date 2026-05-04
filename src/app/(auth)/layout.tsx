import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-dark via-[#16213e] to-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }}></div>
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <span className="text-xl font-bold text-white font-sans">Mastermoosai</span>
              <span className="block text-[10px] text-gray-400 -mt-1 tracking-wider uppercase">Training Institute</span>
            </div>
          </Link>

          {/* Center Content */}
          <div className="my-auto">
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white font-sans leading-tight mb-6">
              Unlock Your <span className="text-primary">Creative</span> &amp; <span className="text-primary">Technical</span> Potential
            </h1>
            <p className="text-lg text-gray-300 font-body leading-relaxed max-w-md">
              Join our community of learners and gain practical skills in Art and Software Development from industry experts.
            </p>

            {/* Stats */}
            <div className="flex items-center space-x-8 mt-10">
              <div>
                <div className="text-3xl font-extrabold text-white font-sans">500+</div>
                <div className="text-sm text-gray-400">Students</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div>
                <div className="text-3xl font-extrabold text-white font-sans">20+</div>
                <div className="text-sm text-gray-400">Courses</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div>
                <div className="text-3xl font-extrabold text-white font-sans">15+</div>
                <div className="text-sm text-gray-400">Instructors</div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Mastermoosai Institute</p>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white">
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-dark font-sans">Mastermoosai</span>
          </Link>
        </div>
        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { registerAction } from "./actions";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await registerAction(formData);
    setLoading(false);
    if (result?.error) toast.error(result.error);
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-dark font-sans">Create Account</h2>
        <p className="text-gray-warm font-body mt-2">Start your learning journey today</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="font-body block text-sm font-semibold text-dark mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input name="name" type="text" required placeholder="John Doe" className="font-body w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
          </div>
        </div>

        <div>
          <label className="font-body block text-sm font-semibold text-dark mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input name="email" type="email" required placeholder="you@example.com" className="font-body w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
          </div>
        </div>

        <div>
          <label className="font-body block text-sm font-semibold text-dark mb-1.5">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input name="phone" type="text" placeholder="+880 1XXXXXXXXX" className="font-body w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-body block text-sm font-semibold text-dark mb-1.5">Password</label>
            <input name="password" type="password" required placeholder="Min 6 chars" className="font-body w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
          </div>
          <div>
            <label className="font-body block text-sm font-semibold text-dark mb-1.5">Confirm</label>
            <input name="passwordConfirmation" type="password" required placeholder="Repeat" className="font-body w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary text-white font-bold font-body rounded-xl hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 transition-all duration-200">
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-gray-warm font-body">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary-dark transition">Sign in</Link>
        </p>
      </form>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await loginAction(formData);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    }
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-dark font-sans">Welcome back</h2>
        <p className="text-gray-warm font-body mt-2">Sign in to your account to continue</p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="font-body block text-sm font-semibold text-dark mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              placeholder="you@example.com"
              className="font-body w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="font-body text-sm font-semibold text-dark">Password</label>
            <Link href="/forgot-password" className="font-body text-sm font-medium text-primary hover:text-primary-dark transition">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter your password"
              className="font-body w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-primary text-white font-bold font-body rounded-xl hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 transition-all duration-200"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-gray-400 font-body">New here?</span></div>
        </div>

        <Link href="/register" className="block w-full py-3.5 text-center border-2 border-gray-200 text-dark font-bold font-body rounded-xl hover:border-primary hover:text-primary transition-all duration-200">
          Create an Account
        </Link>
      </form>
    </>
  );
}

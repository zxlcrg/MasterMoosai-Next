"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { Bell, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";

export function AdminTopbar({ user }: { user: { name: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-900 font-sans">Admin Panel</h1>
      </div>

      <div className="flex items-center space-x-3">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5" />
        </button>

        <div className="relative">
          <button onClick={() => setOpen(!open)} className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user.name?.charAt(0)}</span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">{user.name}</span>
            <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-50 border border-gray-100">
              <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <UserIcon className="w-4 h-4 mr-2" /> Profile
              </Link>
              <div className="border-t my-1"></div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

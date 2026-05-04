"use client";

import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";

export function UserMenu({ user }: { user: { name: string } }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
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
  );
}

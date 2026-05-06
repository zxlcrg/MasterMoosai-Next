"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutGrid, Users, GraduationCap, BookOpen, Tag, ClipboardList, DollarSign,
  Banknote, Calendar, BarChart3, Shield, Settings, ChevronsLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: LayoutGrid },
  { href: "/admin/students", label: "Students", Icon: Users },
  { href: "/admin/teachers", label: "Teachers", Icon: GraduationCap },
  { href: "/admin/courses", label: "Courses", Icon: BookOpen },
  { href: "/admin/categories", label: "Categories", Icon: Tag },
  { href: "/admin/enrollments", label: "Enrollments", Icon: ClipboardList },
  { href: "/admin/payments", label: "Payments", Icon: DollarSign },
  { href: "/admin/teacher-payments", label: "Teacher Pay", Icon: Banknote },
  { href: "/admin/classes", label: "Classes", Icon: Calendar },
];

const adminItems = [
  { href: "/admin/reports", label: "Reports", Icon: BarChart3 },
  { href: "/admin/users", label: "Users & Roles", Icon: Shield },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export function AdminSidebar({ user }: { user: { name: string; role: string } }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-900 sidebar-transition sidebar-scroll overflow-y-auto overflow-x-hidden",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-800 shrink-0">
        <Link href="/admin/dashboard" className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          {!collapsed && <span className="text-white font-bold text-lg truncate">MIMS</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="ml-3 truncate">{label}</span>}
            </Link>
          );
        })}

        <div className="my-3 border-t border-gray-800"></div>

        {adminItems.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="ml-3 truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-gray-800 p-3 shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{user.name?.charAt(0)}</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{user.role.toLowerCase()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="hidden lg:flex items-center justify-center h-10 border-t border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition shrink-0"
      >
        <ChevronsLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  const pages: (number | "ellipsis")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <nav className="flex items-center justify-end gap-1">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        className={cn(
          "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg",
          currentPage === 1
            ? "text-gray-400 pointer-events-none"
            : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </Link>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="px-3 py-2 text-sm text-gray-400">…</span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className={cn(
              "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg",
              p === currentPage
                ? "bg-indigo-600 text-white"
                : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
            )}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        className={cn(
          "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg",
          currentPage === totalPages
            ? "text-gray-400 pointer-events-none"
            : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </nav>
  );
}

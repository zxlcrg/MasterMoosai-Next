"use client";

import { Printer } from "lucide-react";

interface Props {
  label?: string;
  className?: string;
}

export function PrintButton({ label = "Print", className }: Props) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ||
        "inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm no-print"
      }
    >
      <Printer className="w-4 h-4" /> {label}
    </button>
  );
}

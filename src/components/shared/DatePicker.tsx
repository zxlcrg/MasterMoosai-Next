"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface Props {
  name: string;
  required?: boolean;
  defaultValue?: string; // YYYY-MM-DD
  placeholder?: string;
  /** Disabled days, e.g. { before: new Date() } — same shape as react-day-picker. */
  disabled?: any;
  className?: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toDisplay(d: Date | undefined): string {
  if (!d) return "";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function fromIso(value?: string): Date | undefined {
  if (!value) return undefined;
  // Treat the YYYY-MM-DD as a local date, not UTC, so timezone shifts don't
  // bump the day backward by one in negative-offset zones.
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/**
 * Date picker that always displays DD/MM/YYYY but submits YYYY-MM-DD,
 * so server actions and zod schemas don't need to change.
 */
export function DatePicker({ name, required, defaultValue, placeholder = "dd/mm/yyyy", disabled, className }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(() => fromIso(defaultValue));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const isoValue = selected ? toIso(selected) : "";
  const displayValue = toDisplay(selected);

  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-left bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
      </button>

      {/* Hidden input carries the canonical YYYY-MM-DD value to the form. */}
      <input
        type="hidden"
        name={name}
        value={isoValue}
        required={required}
      />

      {open && (
        <div className="absolute z-50 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 p-2">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(d) => {
              setSelected(d);
              setOpen(false);
            }}
            disabled={disabled}
            captionLayout="dropdown"
            startMonth={new Date(2000, 0)}
            endMonth={new Date(2100, 11)}
            // Force d/m/y in the calendar's own labels regardless of locale
            formatters={{
              formatCaption: (date) =>
                `${date.toLocaleString("en-GB", { month: "long" })} ${date.getFullYear()}`,
              formatWeekdayName: (date) =>
                date.toLocaleString("en-GB", { weekday: "narrow" }),
            }}
            weekStartsOn={1}
            className="rdp-mims"
          />
          <div className="flex justify-between px-1 py-1">
            <button
              type="button"
              onClick={() => {
                setSelected(undefined);
                setOpen(false);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                setSelected(today);
                setOpen(false);
              }}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 px-2 py-1"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

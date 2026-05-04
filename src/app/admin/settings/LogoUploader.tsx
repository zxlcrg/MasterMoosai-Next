"use client";

import { useTransition, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  currentLogo: string;
  uploadAction: (formData: FormData) => Promise<{ error?: string; success?: string }>;
  removeAction: () => Promise<{ error?: string; success?: string }>;
}

export function LogoUploader({ currentLogo, uploadAction, removeAction }: Props) {
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("logo", file);
    start(async () => {
      const r = await uploadAction(fd);
      if (r?.error) toast.error(r.error);
      else { toast.success(r.success || "Logo uploaded"); router.refresh(); }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleRemove() {
    start(async () => {
      const r = await removeAction();
      if (r?.error) toast.error(r.error);
      else { toast.success(r.success || "Logo removed"); router.refresh(); }
    });
  }

  return (
    <div className="flex items-center gap-6">
      <div className="shrink-0">
        {currentLogo ? (
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-20 h-20 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          disabled={pending}
          onChange={handleChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
        />
        <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG. Max 2MB. Used in navbar and footer.</p>
        {currentLogo && (
          <button
            onClick={handleRemove}
            disabled={pending}
            className="mt-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            Remove logo (use default)
          </button>
        )}
      </div>
    </div>
  );
}

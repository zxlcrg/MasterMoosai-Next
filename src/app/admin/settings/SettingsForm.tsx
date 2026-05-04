"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  settings: Record<string, string>;
  action: (formData: FormData) => Promise<void>;
}

export function SettingsForm({ settings, action }: Props) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    start(async () => {
      await action(formData);
      toast.success("Settings saved");
      router.refresh();
    });
  }

  const Field = ({ name, label, placeholder, type = "text" }: { name: string; label: string; placeholder?: string; type?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={settings[name] || ""}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );

  const Textarea = ({ name, label, placeholder, rows = 3 }: { name: string; label: string; placeholder?: string; rows?: number }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={settings[name] || ""}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-5">
        <h2 className="text-sm font-semibold uppercase text-gray-500 tracking-wide">Identity</h2>
        <Field name="site_name" label="Site Name" placeholder="Mastermoosai Institute" />
        <Field name="site_tagline" label="Tagline" placeholder="Training Institute" />
      </div>

      <div className="space-y-5 pt-5 border-t border-gray-100">
        <h2 className="text-sm font-semibold uppercase text-gray-500 tracking-wide">Contact</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field name="contact_email" label="Email" type="email" placeholder="info@mastermoosai.com" />
          <Field name="contact_phone" label="Phone" type="tel" placeholder="+880 1777-027856" />
        </div>
        <Field name="address" label="Address" placeholder="Dhaka, Bangladesh" />
      </div>

      <div className="space-y-5 pt-5 border-t border-gray-100">
        <h2 className="text-sm font-semibold uppercase text-gray-500 tracking-wide">Payment</h2>
        <Textarea name="payment_instructions" label="Payment Instructions" placeholder="bKash: 01777-027856 (Personal)..." rows={4} />
      </div>

      <div className="space-y-5 pt-5 border-t border-gray-100">
        <h2 className="text-sm font-semibold uppercase text-gray-500 tracking-wide">Social Links</h2>
        <Field name="facebook_url" label="Facebook URL" type="url" placeholder="https://facebook.com/..." />
        <Field name="instagram_url" label="Instagram URL" type="url" placeholder="https://instagram.com/..." />
        <Field name="youtube_url" label="YouTube URL" type="url" placeholder="https://youtube.com/..." />
      </div>

      <div className="flex justify-end pt-3 border-t border-gray-100">
        <button type="submit" disabled={pending} className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {pending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}

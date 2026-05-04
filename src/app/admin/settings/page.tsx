import { prisma } from "@/lib/prisma";
import { updateSettings } from "./actions";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const all = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  for (const s of all) settings[s.key] = s.value || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-sans">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Public site information and contact details</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <SettingsForm settings={settings} action={updateSettings} />
      </div>
    </div>
  );
}

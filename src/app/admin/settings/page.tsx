import { prisma } from "@/lib/prisma";
import { updateSettings, uploadLogo, removeLogo } from "./actions";
import { SettingsForm } from "./SettingsForm";
import { LogoUploader } from "./LogoUploader";

export default async function SettingsPage() {
  const all = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  for (const s of all) settings[s.key] = s.value || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-sans">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Public site information, logo, and contact details</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Institute Logo</h2>
        <LogoUploader currentLogo={settings.logo || ""} uploadAction={uploadLogo} removeAction={removeLogo} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-3xl">
        <SettingsForm settings={settings} action={updateSettings} />
      </div>
    </div>
  );
}

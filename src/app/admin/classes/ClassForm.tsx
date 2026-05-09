import Link from "next/link";
import { DatePicker } from "@/components/shared/DatePicker";

interface Props {
  initial?: {
    courseId: number;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    mode: string;
    location: string | null;
    meetingLink: string | null;
    status: string;
  };
  courses: { id: number; title: string }[];
  action: (formData: FormData) => Promise<{ error: string } | void>;
  submitLabel: string;
}

export function ClassForm({ initial, courses, action, submitLabel }: Props) {
  const dateValue = initial?.date ? initial.date.toISOString().slice(0, 10) : "";

  return (
    <form action={action as any} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
        <select name="courseId" defaultValue={initial?.courseId || ""} required className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
          <option value="">— Select course —</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Session Title</label>
        <input name="title" type="text" defaultValue={initial?.title} required placeholder="e.g. Lesson 1: Introduction" className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
          <DatePicker name="date" defaultValue={dateValue} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
          <input name="startTime" type="time" defaultValue={initial?.startTime} required className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
          <input name="endTime" type="time" defaultValue={initial?.endTime} required className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mode</label>
          <select name="mode" defaultValue={initial?.mode || "OFFLINE"} className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
            <option value="OFFLINE">In-person</option>
            <option value="ONLINE">Online</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
          <select name="status" defaultValue={initial?.status || "SCHEDULED"} className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Location <span className="text-gray-400">(for in-person)</span></label>
        <input name="location" type="text" defaultValue={initial?.location || ""} placeholder="Room 101, Main Building" className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting Link <span className="text-gray-400">(for online)</span></label>
        <input name="meetingLink" type="url" defaultValue={initial?.meetingLink || ""} placeholder="https://meet.google.com/..." className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
        <Link href="/admin/classes" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</Link>
        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">{submitLabel}</button>
      </div>
    </form>
  );
}

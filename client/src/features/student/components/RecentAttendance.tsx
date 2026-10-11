import { Link } from "react-router-dom";

import type { StudentAttendanceRecord } from "../types/student.types";

interface Props {
  records: StudentAttendanceRecord[];
}

function formatDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return value || "-";
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short" }).format(date);
}

export default function RecentAttendance({ records }: Props) {
  const recent = records.slice(0, 5);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="font-semibold text-slate-950">Recent attendance</h3>
          <p className="text-sm text-slate-500">Your latest class records</p>
        </div>
        <Link to="/student/history" className="text-sm font-semibold text-emerald-700 hover:underline">
          View All
        </Link>
      </div>
      <div className="p-5">
        {recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No attendance records yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((record) => (
              <li key={record.attendanceId} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{record.subject}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(record.sessionDate || record.markedAt)}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    record.status === "present" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {record.status === "present" ? "Present" : "Absent"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

import type { SubjectAttendanceSummary } from "../types/student.types";

interface Props {
  summaries: SubjectAttendanceSummary[];
}

export default function SubjectAttendance({ summaries }: Props) {
  if (summaries.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-950">Subject-wise Attendance</h3>
        <p className="mt-6 py-6 text-center text-sm text-slate-500">No attendance records yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-950">Subject-wise Attendance</h3>
      <ul className="mt-5 space-y-4">
        {summaries.map((item) => (
          <li key={item.subject}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-800">{item.subject}</p>
              <p className="text-sm font-semibold text-slate-700">{item.percentage}%</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Present: {item.present} · Absent: {item.absent}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.percentage}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

import { useMemo, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import { useStudentAttendanceRecords } from "../hooks/useStudentAttendanceRecords";
import type { StudentAttendanceStatus } from "../types/student.types";

function formatDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return value || "-";
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(date);
}

export default function StudentHistoryPage() {
  const { profile, loading } = useAuth();
  const { analytics, isLoading, error } = useStudentAttendanceRecords(profile?.uid, profile?.classId);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [status, setStatus] = useState<"all" | StudentAttendanceStatus>("all");
  const [date, setDate] = useState("");

  const subjects = useMemo(
    () => [...new Set(analytics.history.map((record) => record.subject).filter(Boolean))],
    [analytics.history],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return analytics.history.filter((record) => {
      const matchesSearch = !query || record.subject.toLowerCase().includes(query);
      const matchesSubject = subject === "all" || record.subject === subject;
      const matchesStatus = status === "all" || record.status === status;
      const recordDate = (record.sessionDate || record.markedAt).slice(0, 10);
      const matchesDate = !date || recordDate === date;
      return matchesSearch && matchesSubject && matchesStatus && matchesDate;
    });
  }, [analytics.history, date, search, status, subject]);

  if (loading || isLoading) {
    return <div className="text-slate-600">Loading attendance...</div>;
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Unable to load attendance data. Please try again.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-950">Attendance History</h2>
        <p className="mt-1 text-sm text-slate-500">Search and filter your class attendance records.</p>
      </header>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search subject"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
        />
        <select
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
        >
          <option value="all">All subjects</option>
          {subjects.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as "all" | StudentAttendanceStatus)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
        >
          <option value="all">All status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          No attendance records yet.
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Session</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.attendanceId} className="border-t border-slate-100">
                    <td className="px-4 py-3">{formatDate(record.sessionDate || record.markedAt)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{record.subject}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${record.status === "present" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {record.status === "present" ? "Present" : "Absent"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{record.status === "present" ? formatTime(record.markedAt) : "-"}</td>
                    <td className="px-4 py-3 text-slate-500">{record.sessionId.slice(0, 8)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((record) => (
              <article key={record.attendanceId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{record.subject}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDate(record.sessionDate || record.markedAt)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${record.status === "present" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {record.status === "present" ? "Present" : "Absent"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Time: {record.status === "present" ? formatTime(record.markedAt) : "-"}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

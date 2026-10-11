import { getAttendanceMethodLabel, getMethodRestrictions } from "../../attendance/services/attendance-methods";
import AttendanceTimer from "../../attendance/components/AttendanceTimer";
import type { AttendanceSession } from "../../attendance/types/attendance.types";

interface Props {
  session: AttendanceSession;
  onScanQr: (session: AttendanceSession) => void;
  onEnterCode: (session: AttendanceSession) => void;
}

export default function ActiveSessionCard({ session, onScanQr, onEnterCode }: Props) {
  const methods = getMethodRestrictions(session.attendanceMethod);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Active attendance</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{session.subject}</h3>
          <p className="mt-1 text-sm text-slate-500">Class ID: {session.classId}</p>
        </div>
        <span className="w-fit rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {getAttendanceMethodLabel(session.attendanceMethod)}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <span>Status: Active</span>
        <AttendanceTimer endAt={session.endAt ?? session.endTime} />
        <span>Date: {session.sessionDate || "-"}</span>
        <span>Duration: {session.durationMinutes} min</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {methods.qr && (
          <button
            type="button"
            onClick={() => onScanQr(session)}
            className="rounded-lg bg-emerald-600 px-3 py-2.5 font-semibold text-white hover:bg-emerald-700"
          >
            Scan QR
          </button>
        )}
        {methods.code && (
          <button
            type="button"
            onClick={() => onEnterCode(session)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Enter Code
          </button>
        )}
      </div>
    </article>
  );
}

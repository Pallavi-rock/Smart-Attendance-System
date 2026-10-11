import { useNavigate } from "react-router-dom";

import AttendanceSummaryCards from "../components/AttendanceSummaryCards";
import ActiveSessionCard from "../components/ActiveSessionCard";
import RecentAttendance from "../components/RecentAttendance";
import SubjectAttendance from "../components/SubjectAttendance";
import { useStudentDashboard } from "../hooks/useStudentDashboard";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const {
    studentProfile,
    activeSessions,
    analytics,
    isLoading,
    sessionsError,
    recordsError,
  } = useStudentDashboard();

  if (isLoading) {
    return <div className="text-slate-600">Loading attendance...</div>;
  }

  if (!studentProfile) {
    return <div className="text-slate-600">Unable to load attendance data. Please try again.</div>;
  }

  const hasNoRecords = analytics.totalClasses === 0;
  const initials = studentProfile.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
              {initials || "S"}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">Welcome back</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{studentProfile.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {studentProfile.classId ? `Class ID: ${studentProfile.classId}` : "Student"}
                {studentProfile.semester ? ` · Semester ${studentProfile.semester}` : ""}
              </p>
              <p className="mt-1 text-sm text-slate-500">{studentProfile.email}</p>
            </div>
          </div>
          <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
            {studentProfile.role}
          </span>
        </div>
      </section>

      {recordsError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load attendance data. Please try again.
        </div>
      ) : null}

      <AttendanceSummaryCards
        totalClasses={analytics.totalClasses}
        classesAttended={analytics.classesAttended}
        classesAbsent={analytics.classesAbsent}
        percentage={analytics.percentage}
        isEmpty={hasNoRecords}
      />

      {hasNoRecords ? (
        <p className="text-sm text-slate-500">No attendance records yet.</p>
      ) : null}

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Active attendance</h3>
        {sessionsError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to load attendance data. Please try again.
          </div>
        ) : activeSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No active attendance session
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {activeSessions.map((session) => (
              <ActiveSessionCard
                key={session.sessionId}
                session={session}
                onScanQr={(nextSession) => navigate(`/student/attendance?session=${nextSession.sessionId}&method=qr`)}
                onEnterCode={(nextSession) => navigate(`/student/attendance?session=${nextSession.sessionId}&method=code`)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentAttendance records={analytics.history} />
        <SubjectAttendance summaries={analytics.subjectSummaries} />
      </div>
    </div>
  );
}

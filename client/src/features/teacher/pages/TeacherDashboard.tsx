import { useState } from "react";

import { getAttendanceMethodLabel } from "../../attendance/services/attendance-methods";
import type { SessionFormValues } from "../schemas/sessionSchema";
import SessionForm from "../components/SessionForm";
import { useTeacherDashboard } from "../hooks/useTeacherDashboard";
import AttendanceTimer from "../../attendance/components/AttendanceTimer";
import QRCodeDisplay from "../../attendance/components/QRCodeDisplay";
import LiveAttendanceTable from "../../attendance/components/LiveAttendanceTable";
import { useLiveAttendance } from "../../attendance/hooks/useLiveAttendance";

export default function TeacherDashboard() {
  const {
    teacherProfile,
    activeSessions,
    recentSessions,
    loading,
    isCreating,
    error,
    successMessage,
    handleCreateSession,
    handleLogout,
  } = useTeacherDashboard();

  const [showForm, setShowForm] = useState(false);
  const currentSession = activeSessions[0];
  const liveAttendance = useLiveAttendance(currentSession?.sessionId);

  if (loading) {
    return <div className="p-6 text-slate-600">Loading teacher dashboard...</div>;
  }

  if (!teacherProfile) {
    return <div className="p-6 text-slate-600">Unable to load teacher profile.</div>;
  }

  const onSubmit = async (values: SessionFormValues) => {
    await handleCreateSession({
      ...values,
      location: {
        latitude: values.latitude,
        longitude: values.longitude,
      },
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-100">Teacher dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">{teacherProfile.name}</h1>
          </div>

          <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Email</p>
            <p className="mt-1 font-medium">{teacherProfile.email}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 font-semibold text-white transition hover:bg-white/20"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Attendance management</h2>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((previousState) => !previousState)}
          className="rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white transition hover:bg-green-700"
        >
          {showForm ? "Close form" : "Create Attendance Session"}
        </button>
      </div>

      {showForm && (
        <div className="max-w-2xl">
          <SessionForm isSubmitting={isCreating} onSubmit={onSubmit} error={error} />
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {error && !showForm && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {currentSession && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Active Session</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-800">{currentSession.subject}</h2>
              <p className="text-slate-600">Class: {currentSession.classId}</p>
              <p className="mt-3"><AttendanceTimer endAt={currentSession.endAt} /></p>
            </div>
            <div className="flex flex-wrap items-start gap-4">
              {currentSession.qrSessionToken && <QRCodeDisplay value={`${currentSession.sessionId}:${currentSession.qrSessionToken}`} />}
              {currentSession.attendanceCode && <div className="rounded-lg bg-white px-4 py-3 text-center"><p className="text-xs uppercase text-slate-500">Attendance Code</p><p className="mt-1 text-2xl font-bold tracking-widest text-slate-800">{currentSession.attendanceCode}</p></div>}
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-white p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-slate-800">Live Attendance</h3><span className="font-semibold text-emerald-700">Students Present: {liveAttendance.records.length}</span></div>{liveAttendance.error ? <p className="text-sm text-red-600">{liveAttendance.error}</p> : <LiveAttendanceTable records={liveAttendance.records} />}</div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Active Sessions</h3>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {activeSessions.length}
            </span>
          </div>

          {activeSessions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-sm text-slate-500">
              No active sessions right now.
            </p>
          ) : (
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.sessionId} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-800">{session.subject}</p>
                      <p className="text-sm text-slate-500">{session.classId}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {session.status}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <span>Method: <strong>{getAttendanceMethodLabel(session.attendanceMethod)}</strong></span>
                    {session.attendanceCode ? <span>Code: <strong>{session.attendanceCode}</strong></span> : <span>Code: <strong>Not enabled</strong></span>}
                    {session.qrSessionToken ? <span>QR Token: <strong>{session.qrSessionToken}</strong></span> : <span>QR: <strong>Not enabled</strong></span>}
                    <span>Duration: {session.durationMinutes} min</span>
                    <span>Date: {session.sessionDate}</span>
                    <span>Start: {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Recent Sessions</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {recentSessions.length}
            </span>
          </div>

          {recentSessions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-sm text-slate-500">
              No recent sessions yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.sessionId} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{session.subject}</p>
                      <p className="text-sm text-slate-500">{session.classId}</p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {session.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">
                    {session.sessionDate} · {getAttendanceMethodLabel(session.attendanceMethod)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

import { getMethodRestrictions } from "../../attendance/services/attendance-methods";
import type { AttendanceSession } from "../../attendance/types/attendance.types";
import ActiveSessionCard from "../components/ActiveSessionCard";
import AttendanceCodeInput from "../components/AttendanceCodeInput";
import QRCodeScanner from "../components/QRCodeScanner";
import { useActiveSessions } from "../hooks/useActiveSessions";
import { useAuth } from "../../auth/hooks/useAuth";
import { useMarkAttendance } from "../hooks/useMarkAttendance";

export default function StudentAttendancePage() {
  const { profile, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { sessions, isLoading, error } = useActiveSessions(profile?.classId);
  const { markAttendance, isSubmitting } = useMarkAttendance();
  const [scannerSession, setScannerSession] = useState<AttendanceSession | null>(null);
  const [codeSession, setCodeSession] = useState<AttendanceSession | null>(null);

  const requestedSession = useMemo(
    () => sessions.find((session) => session.sessionId === searchParams.get("session")) ?? null,
    [searchParams, sessions],
  );

  const requestedMethod = searchParams.get("method");

  const activeScannerSession = scannerSession ?? (requestedMethod === "qr" ? requestedSession : null);
  const activeCodeSession = codeSession ?? (requestedMethod === "code" ? requestedSession : null);

  const clearParams = () => {
    setSearchParams({});
    setScannerSession(null);
    setCodeSession(null);
  };

  if (loading || isLoading) {
    return <div className="text-slate-600">Loading attendance...</div>;
  }

  const openScanner = (session: AttendanceSession) => {
    const methods = getMethodRestrictions(session.attendanceMethod);
    if (!methods.qr) {
      return;
    }
    setCodeSession(null);
    setScannerSession(session);
    setSearchParams({ session: session.sessionId, method: "qr" });
  };

  const openCode = (session: AttendanceSession) => {
    const methods = getMethodRestrictions(session.attendanceMethod);
    if (!methods.code) {
      return;
    }
    setScannerSession(null);
    setCodeSession(session);
    setSearchParams({ session: session.sessionId, method: "code" });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-950">Mark Attendance</h2>
        <p className="mt-1 text-sm text-slate-500">
          Scan the live QR code with your camera or enter the attendance code. Location is requested only when you mark attendance.
        </p>
      </header>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load attendance data. Please try again.
        </div>
      ) : null}

      {activeScannerSession ? (
        <QRCodeScanner
          onResult={(value) => {
            void markAttendance(activeScannerSession, "qr", value)
              .then(clearParams)
              .catch(() => {
                setScannerSession(null);
              });
          }}
          onClose={clearParams}
          onError={(message) => toast.error(message)}
        />
      ) : null}

      {activeCodeSession ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-900">Enter code for {activeCodeSession.subject}</h3>
          <AttendanceCodeInput
            isSubmitting={isSubmitting}
            onSubmit={async (code) => {
              if (!code) {
                toast.error("Attendance code is required.");
                return;
              }
              try {
                await markAttendance(activeCodeSession, "code", code);
                clearParams();
              } catch {
                // Keep the code form open so the student can retry.
              }
            }}
          />
        </section>
      ) : null}

      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          No active attendance session
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <ActiveSessionCard
              key={session.sessionId}
              session={session}
              onScanQr={openScanner}
              onEnterCode={openCode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

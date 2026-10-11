import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useAuth } from "../../auth/hooks/useAuth";
import AttendanceSummaryCards from "../components/AttendanceSummaryCards";
import SubjectAttendance from "../components/SubjectAttendance";
import { useStudentAttendanceRecords } from "../hooks/useStudentAttendanceRecords";

const COLORS = ["#059669", "#e11d48"];

export default function StudentAnalyticsPage() {
  const { profile, loading } = useAuth();
  const { analytics, isLoading, error } = useStudentAttendanceRecords(profile?.uid, profile?.classId);

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

  const pieData = [
    { name: "Present", value: analytics.classesAttended },
    { name: "Absent", value: analytics.classesAbsent },
  ];
  const isEmpty = analytics.totalClasses === 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-950">My Attendance</h2>
        <p className="mt-1 text-sm text-slate-500">Calculated from your Firestore attendance records and class sessions.</p>
      </header>

      <AttendanceSummaryCards
        totalClasses={analytics.totalClasses}
        classesAttended={analytics.classesAttended}
        classesAbsent={analytics.classesAbsent}
        percentage={analytics.percentage}
        isEmpty={isEmpty}
      />

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          No attendance records yet.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-950">Present vs Absent</h3>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.name === "Present" ? COLORS[0] : COLORS[1]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
          <SubjectAttendance summaries={analytics.subjectSummaries} />
        </div>
      )}
    </div>
  );
}

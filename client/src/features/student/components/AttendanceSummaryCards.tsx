import { CalendarCheck, Percent, UserCheck, UserX } from "lucide-react";

interface Props {
  totalClasses: number;
  classesAttended: number;
  classesAbsent: number;
  percentage: number;
  isEmpty: boolean;
}

const cards = [
  { key: "total", label: "Total Classes", icon: CalendarCheck, color: "text-blue-600 bg-blue-50" },
  { key: "attended", label: "Classes Attended", icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
  { key: "absent", label: "Classes Absent", icon: UserX, color: "text-amber-600 bg-amber-50" },
  { key: "percentage", label: "Attendance Percentage", icon: Percent, color: "text-violet-600 bg-violet-50" },
] as const;

export default function AttendanceSummaryCards({
  totalClasses,
  classesAttended,
  classesAbsent,
  percentage,
  isEmpty,
}: Props) {
  const values = {
    total: totalClasses,
    attended: classesAttended,
    absent: classesAbsent,
    percentage: `${percentage}%`,
  };

  return (
    <section aria-label="Attendance summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, color }) => (
        <article key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">
                {isEmpty && key !== "percentage" ? 0 : values[key]}
              </p>
            </div>
            <span className={`rounded-xl p-3 ${color}`}>
              <Icon size={21} />
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}

import { useAuth } from "../../auth/hooks/useAuth";

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export default function StudentProfilePage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="text-slate-600">Loading attendance...</div>;
  }

  if (!profile) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Unable to load attendance data. Please try again.
      </div>
    );
  }

  const initials = profile.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const fields = [
    { label: "Name", value: profile.name },
    { label: "Class ID", value: profile.classId || "-" },
    { label: "Email", value: profile.email },
    { label: "Role", value: profile.role },
    { label: "Department", value: profile.department || "-" },
    { label: "Semester", value: profile.semester || "-" },
    { label: "Account created", value: formatDate(profile.createdAt) },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
            {initials || "S"}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-950">{profile.name}</h2>
            <p className="text-sm text-slate-500">Student profile is read-only.</p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-slate-100">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-slate-500">{field.label}</dt>
              <dd className="text-sm font-semibold text-slate-900">{field.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

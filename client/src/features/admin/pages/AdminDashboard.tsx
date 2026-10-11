import { Activity, GraduationCap, ShieldCheck, UserCheck, UserX, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { adminService, getAdminErrorMessage, type AdminActivity, type AdminDashboardStats } from "../services/admin.service";

const statCards = [
  { key: "students", label: "Students", note: "Registered learners", icon: GraduationCap, color: "text-blue-600 bg-blue-50" },
  { key: "teachers", label: "Teachers", note: "Teaching accounts", icon: Users, color: "text-violet-600 bg-violet-50" },
  { key: "admins", label: "Administrators", note: "Authorized staff", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" },
  { key: "activeAdmins", label: "Active admins", note: "Can access the portal", icon: UserCheck, color: "text-teal-600 bg-teal-50" },
  { key: "inactiveAdmins", label: "Inactive admins", note: "Access currently paused", icon: UserX, color: "text-amber-600 bg-amber-50" },
] as const;

function formatActivity(activity: AdminActivity) {
  const labels: Record<string, string> = { admin_created: "Administrator invited", admin_activated: "Administrator reactivated", admin_deactivated: "Administrator deactivated" };
  return labels[activity.action] ?? "Administrator profile updated";
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Recently";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    void Promise.all([adminService.getDashboardStats(), adminService.getRecentActivity()])
      .then(([nextStats, nextActivity]) => { setStats(nextStats); setActivity(nextActivity); })
      .catch((reason: unknown) => setError(getAdminErrorMessage(reason)));
  };

  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer); }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">Overview</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Welcome back</h2><p className="mt-2 text-slate-500">A quick view of your institution's account activity.</p></header>
      {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"><span>Unable to load dashboard data.</span><button type="button" onClick={load} className="font-semibold underline underline-offset-4">Try again</button></div>}
      <section aria-label="Account statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map(({ key, label, note, icon: Icon, color }) => <article key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold text-slate-950">{stats ? stats[key] : <span className="inline-block h-9 w-14 animate-pulse rounded bg-slate-200" aria-label="Loading" />}</p></div><span className={`rounded-xl p-3 ${color}`}><Icon size={21} /></span></div><p className="mt-4 text-xs text-slate-500">{note}</p></article>)}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 sm:px-6"><span className="rounded-lg bg-slate-100 p-2 text-slate-600"><Activity size={18} /></span><div><h3 className="font-semibold text-slate-950">Recent admin activity</h3><p className="text-sm text-slate-500">Security events from the administrator audit log.</p></div></div><div className="p-5 sm:p-6">{activity.length ? <ul className="divide-y divide-slate-100">{activity.map((item, index) => <li key={`${item.targetUid}-${item.action}-${index}`} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div><p className="text-sm font-semibold text-slate-800">{formatActivity(item)}</p><p className="mt-1 text-xs text-slate-500">Administrator account activity</p></div><time className="shrink-0 text-xs text-slate-500">{formatDate(item.createdAt)}</time></li>)}</ul> : <div className="py-8 text-center"><Activity className="mx-auto text-slate-300" size={28} /><p className="mt-3 text-sm font-semibold text-slate-700">No recent activity</p><p className="mt-1 text-sm text-slate-500">Administrator changes will appear here.</p></div>}</div></section>
    </div>
  );
}
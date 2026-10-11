import { Search, ShieldCheck, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { auth } from "../../../lib/firebase";
import { useAuth } from "../../auth/hooks/useAuth";
import type { UserProfile, UserStatus } from "../../auth/types/auth.types";
import { adminInviteSchema, type AdminInviteSchemaType } from "../schemas/adminInviteSchema";
import { adminService, getAdminErrorMessage } from "../services/admin.service";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

function dateLabel(value: string | null) { return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value)) : "Pending"; }
function initials(admin: UserProfile) { return (admin.name || admin.email || "A").split(/[\s@]+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }

function InviteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AdminInviteSchemaType>({ resolver: zodResolver(adminInviteSchema) });
  const [error, setError] = useState<string | null>(null);
  const submit = async (data: AdminInviteSchemaType) => {
    try {
      setError(null);
      const result = await adminService.createAdmin(data);
      try {
        await sendPasswordResetEmail(auth, result.email);
      } catch {
        toast.error("Administrator created, but the invitation email could not be sent.");
        onSuccess();
        onClose();
        return;
      }
      reset();
      toast.success("Administrator invitation sent.");
      onSuccess();
      onClose();
    } catch (reason) {
      setError(getAdminErrorMessage(reason));
    }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="invite-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><h2 id="invite-title" className="text-xl font-bold text-slate-950">Invite Administrator</h2><p className="mt-1 text-sm text-slate-500">The administrator will receive an email to set their password.</p></div><button type="button" aria-label="Close invitation dialog" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={19} /></button></div><form onSubmit={handleSubmit(submit)} className="mt-6 space-y-4"><label className="block text-sm font-semibold text-slate-700">Full name<input {...register("name")} autoFocus className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />{errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name.message}</span>}</label><label className="block text-sm font-semibold text-slate-700">Email address<input {...register("email")} type="email" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />{errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span>}</label>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"><UserPlus size={17} />{isSubmitting ? "Sending..." : "Send Invitation"}</button></div></form></section></div>;
}

function ConfirmModal({ admin, status, onCancel, onConfirm, busy }: { admin: UserProfile; status: UserStatus; onCancel: () => void; onConfirm: () => void; busy: boolean }) {
  const isActive = status === "active";
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><section role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><h2 id="confirm-title" className="text-xl font-bold text-slate-950">{isActive ? "Reactivate administrator?" : "Deactivate administrator?"}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{isActive ? `${admin.name || admin.email} will regain access to the admin portal.` : "This administrator will no longer be able to access the admin portal."}</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="button" disabled={busy} onClick={onConfirm} className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${isActive ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>{busy ? "Updating..." : isActive ? "Reactivate" : "Deactivate"}</button></div></section></div>;
}

export default function AdminManagementPage() {
  const { profile } = useAuth();
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState<(QueryDocumentSnapshot<DocumentData> | null)[]>([null]);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ admin: UserProfile; status: UserStatus } | null>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  const loadPage = async (pageNumber: number, cursor: QueryDocumentSnapshot<DocumentData> | null) => {
    try { setLoading(true); setError(null); const result = await adminService.listAdmins(25, cursor); setAdmins(result.admins); setHasMore(result.hasMore); setPage(pageNumber); setCursors((previous) => { const next = previous.slice(0, pageNumber + 1); next[pageNumber] = cursor; next[pageNumber + 1] = result.cursor; return next; }); } catch (reason) { setError(getAdminErrorMessage(reason)); } finally { setLoading(false); }
  };
  useEffect(() => { const timer = window.setTimeout(() => { void loadPage(0, null); }, 0); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setInviteOpen(false); setConfirm(null); } }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, []);

  const visibleAdmins = admins.filter((admin) => `${admin.name} ${admin.email}`.toLowerCase().includes(search.trim().toLowerCase()));
  const changeStatus = async () => {
    if (!confirm) return;
    try { setBusyUid(confirm.admin.uid); await adminService.setAdminStatus({ uid: confirm.admin.uid, status: confirm.status }); toast.success(`Administrator ${confirm.status === "active" ? "reactivated" : "deactivated"}.`); setConfirm(null); await loadPage(page, cursors[page] ?? null); } catch (reason) { toast.error(getAdminErrorMessage(reason)); } finally { setBusyUid(null); }
  };

  return <div className="mx-auto max-w-7xl space-y-6"><header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">Access control</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Administrators</h2><p className="mt-2 text-slate-500">Manage authorized administrators and their portal access.</p></div><button type="button" onClick={() => setInviteOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><UserPlus size={18} />Invite Administrator</button></header>{error && <div role="alert" className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span>Unable to load administrators.</span><button type="button" onClick={() => void loadPage(page, cursors[page] ?? null)} className="font-semibold underline underline-offset-4">Try again</button></div>}<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h3 className="font-semibold text-slate-950">Administrator directory</h3><p className="mt-1 text-xs text-slate-500">Showing up to 25 accounts per page.</p></div><label className="relative block sm:w-72"><span className="sr-only">Search administrators</span><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this page" className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></label></div>{loading ? <div className="space-y-3 p-5"><div className="h-14 animate-pulse rounded-lg bg-slate-100" /><div className="h-14 animate-pulse rounded-lg bg-slate-100" /><div className="h-14 animate-pulse rounded-lg bg-slate-100" /></div> : visibleAdmins.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Administrator</th><th className="px-5 py-3 font-semibold">Email</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Created</th><th className="px-5 py-3 text-right font-semibold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleAdmins.map((admin) => { const self = admin.uid === profile?.uid; return <tr key={admin.uid} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{initials(admin)}</span><span className="font-semibold text-slate-900">{admin.name || "Unnamed administrator"}</span></div></td><td className="px-5 py-4 text-slate-600">{admin.email}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${admin.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}><span className={`h-1.5 w-1.5 rounded-full ${admin.status === "active" ? "bg-emerald-600" : "bg-slate-400"}`} />{admin.status.toUpperCase()}</span></td><td className="px-5 py-4 text-slate-500">{dateLabel(admin.createdAt)}</td><td className="px-5 py-4 text-right">{self && admin.status === "active" ? <span className="text-xs text-slate-400">Current account</span> : <button type="button" disabled={busyUid === admin.uid} onClick={() => setConfirm({ admin, status: admin.status === "active" ? "inactive" : "active" })} className={`font-semibold ${admin.status === "active" ? "text-red-600 hover:text-red-700" : "text-emerald-600 hover:text-emerald-700"}`}>{admin.status === "active" ? "Deactivate" : "Reactivate"}</button>}</td></tr>; })}</tbody></table></div> : <div className="p-12 text-center"><ShieldCheck className="mx-auto text-slate-300" size={32} /><p className="mt-3 font-semibold text-slate-700">{search ? "No results for your search" : "No administrators found"}</p><p className="mt-1 text-sm text-slate-500">{search ? "Try a different name or email." : "Invite an administrator to get started."}</p></div>}<div className="flex items-center justify-between border-t border-slate-200 px-5 py-3"><span className="text-xs text-slate-500">Page {page + 1}</span><div className="flex gap-2"><button type="button" disabled={page === 0 || loading} onClick={() => void loadPage(page - 1, cursors[page - 1] ?? null)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button type="button" disabled={!hasMore || loading} onClick={() => void loadPage(page + 1, cursors[page + 1] ?? null)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div></section>{inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onSuccess={() => void loadPage(0, null)} />}{confirm && <ConfirmModal admin={confirm.admin} status={confirm.status} busy={busyUid === confirm.admin.uid} onCancel={() => setConfirm(null)} onConfirm={() => void changeStatus()} />}</div>;
}
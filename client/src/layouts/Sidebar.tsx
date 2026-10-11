import { LayoutDashboard, ShieldCheck, X } from "lucide-react";
import { NavLink } from "react-router-dom";

interface Props { open: boolean; onClose: () => void; }

export default function Sidebar({ open, onClose }: Props) {
   return (
      <>
         {open && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" />}
         <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
               <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">SA</div><div><p className="font-bold text-slate-900">Smart Attendance</p><p className="text-xs text-slate-500">Admin Portal</p></div></div>
               <button type="button" aria-label="Close navigation" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"><X size={20} /></button>
            </div>
            <nav aria-label="Admin navigation" className="flex-1 space-y-1 p-4">
               <NavLink to="/admin/dashboard" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}><LayoutDashboard size={18} />Overview</NavLink>
               <NavLink to="/admin/users/admins" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}><ShieldCheck size={18} />Administrators</NavLink>
            </nav>
            <div className="border-t border-slate-200 p-4 text-xs leading-5 text-slate-500">Authorized administration only</div>
         </aside>
      </>
   );
}
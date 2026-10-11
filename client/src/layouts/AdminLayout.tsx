import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const title = location.pathname.includes("admins") ? "Administrators" : "Overview";
  const initials = (profile?.name || profile?.email || "A").split(/[\s@]+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3"><button type="button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu size={21} /></button><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Admin Portal</p><h1 className="text-lg font-bold text-slate-900">{title}</h1></div></div>
          <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-900">{profile?.name || "Administrator"}</p><span className="text-xs text-slate-500">Administrator</span></div><div aria-label={`Signed in as ${profile?.name || "administrator"}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{initials}</div><button type="button" onClick={() => void handleLogout()} aria-label="Log out" title="Log out" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><LogOut size={18} /></button></div>
        </header>
        <main className="flex-1 p-4 sm:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
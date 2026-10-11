import {
  ClipboardCheck,
  History,
  LayoutDashboard,
  LogOut,
  PieChart,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import type { UserProfile } from "../features/auth/types/auth.types";

interface Props {
  open: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onLogout: () => void;
}

const navItems = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/attendance", label: "Mark Attendance", icon: ClipboardCheck },
  { to: "/student/history", label: "Attendance History", icon: History },
  { to: "/student/analytics", label: "My Attendance", icon: PieChart },
  { to: "/student/profile", label: "Profile", icon: UserRound },
  { to: "/student/settings", label: "Settings", icon: Settings },
];

export default function StudentSidebar({ open, onClose, profile, onLogout }: Props) {
  const initials = (profile?.name || profile?.email || "S")
    .split(/[\s@]+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white">
              SA
            </div>
            <div>
              <p className="font-bold text-slate-900">Smart Attendance</p>
              <p className="text-xs text-slate-500">Student Portal</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{profile?.name || "Student"}</p>
              <p className="truncate text-xs text-slate-500">
                {profile?.classId ? `Class ID: ${profile.classId}` : "Student"}
              </p>
            </div>
          </div>
        </div>

        <nav aria-label="Student navigation" className="flex-1 space-y-1 p-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

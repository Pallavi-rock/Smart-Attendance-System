import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/hooks/useAuth";

export default function StudentSettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-950">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Only account actions that are actually supported are shown here.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Account</h3>
        <p className="mt-2 text-sm text-slate-500">Sign out of your student account on this device.</p>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700"
        >
          Logout
        </button>
      </section>
    </div>
  );
}

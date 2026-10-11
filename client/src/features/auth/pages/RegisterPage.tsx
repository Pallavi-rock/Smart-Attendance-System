import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, School } from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">

        <h1 className="mb-2 text-center text-3xl font-bold">Create your account</h1>
        <p className="mb-8 text-center text-gray-500">Choose the account type that matches your role.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => navigate("/register/student")} className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <GraduationCap className="text-blue-600" size={28} />
            <span className="mt-4 block font-semibold text-slate-900">Student</span>
            <span className="mt-1 block text-sm text-slate-500">Create an active student account.</span>
          </button>
          <button type="button" onClick={() => navigate("/register/teacher")} className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <School className="text-blue-600" size={28} />
            <span className="mt-4 block font-semibold text-slate-900">Teacher</span>
            <span className="mt-1 block text-sm text-slate-500">Create your active teacher account.</span>
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
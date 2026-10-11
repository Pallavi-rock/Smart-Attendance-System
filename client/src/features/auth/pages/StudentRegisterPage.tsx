import { Link } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";

export default function StudentRegisterPage() {
  return <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4"><main className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl"><h1 className="text-3xl font-bold text-slate-900">Student registration</h1><p className="mt-2 mb-8 text-slate-500">Create your active student account.</p><RegisterForm accountType="student" /><p className="mt-6 text-center text-sm text-slate-600"><Link to="/register" className="font-semibold text-blue-600 hover:underline">Choose another account type</Link></p></main></div>;
}
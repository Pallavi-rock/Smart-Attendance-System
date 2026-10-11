import { Link } from "react-router-dom";
import ForgotPasswordForm from "../components/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="mb-2 text-center text-3xl font-bold">
          Forgot Password
        </h1>

        <p className="mb-8 text-center text-gray-500">
          Enter your registered email.
        </p>

        <ForgotPasswordForm />

        <p className="mt-6 text-center">
          <Link
            to="/login"
            className="text-blue-600 hover:underline"
          >
            Back to Login
          </Link>
        </p>

      </div>

    </div>
  );
};

export default ForgotPasswordPage;
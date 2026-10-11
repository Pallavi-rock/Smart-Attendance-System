import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { loginSchema, type LoginSchemaType } from "../schemas/loginSchema";
import { getAuthErrorMessage } from "../services/auth.service";
import { useAuth } from "../hooks/useAuth";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });
  const [authError, setAuthError] = useState<string | null>(null);

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      setAuthError(null);
      const profile = await login(data.email, data.password);
      navigate(`/${profile.role}/dashboard`, { replace: true });
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid user role in Firestore profile") {
        navigate("/unauthorized", { replace: true });
        return;
      }

      setAuthError(getAuthErrorMessage(error));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* Email */}

      <div>
        <label className="mb-2 block font-medium">
          Email
        </label>

        <input
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600"
        />

        {errors.email && (
          <p className="mt-1 text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}

      <div>
        <label className="mb-2 block font-medium">
          Password
        </label>

        <input
          type="password"
          placeholder="Enter password"
          {...register("password")}
          className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600"
        />

        {errors.password && (
          <p className="mt-1 text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Forgot Password */}

      <div className="text-right">
        <a
          href="/forgot-password"
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot Password?
        </a>
      </div>

      {authError && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {authError}
        </p>
      )}

      {/* Button */}

      <button
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {isSubmitting ? "Signing In..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  registerSchema,
  type RegisterSchemaType,
} from "../schemas/registerSchema";
import { getAuthErrorMessage } from "../services/auth.service";
import { useAuth } from "../hooks/useAuth";

interface Props {
  accountType: "student" | "teacher";
}

const RegisterForm = ({ accountType }: Props) => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const onSubmit = async (data: RegisterSchemaType) => {
    try {
      setAuthError(null);
      await registerUser({ ...data, role: accountType });
      setRegistrationSuccess(true);
      navigate(`/${accountType}/dashboard`, { replace: true });
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input {...register("accountType")} type="hidden" value={accountType} readOnly />
      {/* Name */}
      <div>
        <label className="mb-2 block font-medium">Full Name</label>

        <input
          {...register("name")}
          type="text"
          placeholder="Enter full name"
          className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-600 outline-none"
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="mb-2 block font-medium">Email</label>

        <input
          {...register("email")}
          type="email"
          placeholder="Enter email"
          className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-600 outline-none"
        />

        {errors.email && (
          <p className="mt-1 text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block font-medium">Department</label>
        <input {...register("department")} className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600" />
        {errors.department && <p className="mt-1 text-sm text-red-500">{errors.department.message}</p>}
      </div>

      {accountType === "student" ? <div>
        <label className="mb-2 block font-medium">Semester</label>
        <input {...register("semester")} className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600" />
        {errors.semester && <p className="mt-1 text-sm text-red-500">{errors.semester.message}</p>}
      </div> : <>
        <div>
          <label className="mb-2 block font-medium">Employee ID</label>
          <input {...register("employeeId")} className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600" />
          {errors.employeeId && <p className="mt-1 text-sm text-red-500">{errors.employeeId.message}</p>}
        </div>
        <div>
          <label className="mb-2 block font-medium">Subjects</label>
          <input {...register("subjects")} placeholder="e.g. Mathematics, Physics" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600" />
          {errors.subjects && <p className="mt-1 text-sm text-red-500">{errors.subjects.message}</p>}
        </div>
      </>}

      {accountType === "student" && <div>
        <label className="mb-2 block font-medium">Class</label>
        <input {...register("classId")} placeholder="e.g. 12-A" className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600" />
        {errors.classId && <p className="mt-1 text-sm text-red-500">{errors.classId.message}</p>}
      </div>}

      {/* Password */}
      <div>
        <label className="mb-2 block font-medium">Password</label>

        <input
          {...register("password")}
          type="password"
          placeholder="Enter password"
          className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-600 outline-none"
        />

        {errors.password && (
          <p className="mt-1 text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="mb-2 block font-medium">
          Confirm Password
        </label>

        <input
          {...register("confirmPassword")}
          type="password"
          placeholder="Confirm password"
          className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-600 outline-none"
        />

        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {authError && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {authError}
        </p>
      )}

      {registrationSuccess && (
        <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Account created successfully. Redirecting to your dashboard...
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-green-600 p-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
      >
        {isSubmitting
          ? "Creating Account..."
          : accountType === "student" ? "Create Student Account" : "Create Teacher Account"}
      </button>
    </form>
  );
};

export default RegisterForm;
import { useForm } from "react-hook-form";

import { sessionSchema, type SessionFormValues } from "../schemas/sessionSchema";

interface SessionFormProps {
  isSubmitting: boolean;
  onSubmit: (values: SessionFormValues) => Promise<void> | void;
  error: string | null;
}

const defaultDate = new Date().toISOString().split("T")[0];

export default function SessionForm({ isSubmitting, onSubmit, error }: SessionFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SessionFormValues>({
    defaultValues: {
      subject: "",
      classId: "",
      sessionDate: defaultDate,
      startTime: "09:00",
      durationMinutes: 60,
      attendanceMethod: "both",
      latitude: undefined,
      longitude: undefined,
    },
  });

  const submitHandler = async (values: SessionFormValues) => {
    clearErrors();

    const validation = sessionSchema.safeParse(values);

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];

        if (typeof fieldName === "string") {
          setError(fieldName as keyof SessionFormValues, {
            type: "manual",
            message: issue.message,
          });
        }
      });

      return;
    }

    await onSubmit(validation.data);
  };

  return (
    <form onSubmit={handleSubmit((values) => void submitHandler(values))} className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Subject</label>
        <input
          {...register("subject")}
          type="text"
          placeholder="e.g. Mathematics"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500"
        />
        {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">Attendance Area Center</p>
        <p className="mb-3 text-xs text-slate-500">Enter the session location coordinates. Student attendance is allowed within 10 meters of this point. No browser location permission is needed for teachers.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-600">
            Latitude
            <input {...register("latitude", { valueAsNumber: true })} type="number" step="any" placeholder="e.g. 19.0760" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500" />
            {errors.latitude && <span className="mt-1 block text-red-500">{errors.latitude.message}</span>}
          </label>
          <label className="text-sm text-slate-600">
            Longitude
            <input {...register("longitude", { valueAsNumber: true })} type="number" step="any" placeholder="e.g. 72.8777" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500" />
            {errors.longitude && <span className="mt-1 block text-red-500">{errors.longitude.message}</span>}
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Class / Course</label>
        <input
          {...register("classId")}
          type="text"
          placeholder="e.g. CS-201"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500"
        />
        {errors.classId && <p className="mt-1 text-sm text-red-500">{errors.classId.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Session Date</label>
          <input
            {...register("sessionDate")}
            type="date"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500"
          />
          {errors.sessionDate && <p className="mt-1 text-sm text-red-500">{errors.sessionDate.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Start Time</label>
          <input
            {...register("startTime")}
            type="time"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500"
          />
          {errors.startTime && <p className="mt-1 text-sm text-red-500">{errors.startTime.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Duration (minutes)</label>
          <input
            {...register("durationMinutes", { valueAsNumber: true })}
            type="number"
            min={1}
            max={480}
            placeholder="60"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500"
          />
          {errors.durationMinutes && (
            <p className="mt-1 text-sm text-red-500">{errors.durationMinutes.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Attendance Method</label>
        <select
          {...register("attendanceMethod")}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500"
        >
          <option value="both">QR + Attendance Code</option>
          <option value="qr">QR Code Only</option>
          <option value="code">Attendance Code Only</option>
        </select>
      </div>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating session..." : "Create Attendance Session"}
      </button>
    </form>
  );
}

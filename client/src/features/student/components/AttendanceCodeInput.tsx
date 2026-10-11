import { useState } from "react";

interface Props {
  isSubmitting: boolean;
  onSubmit: (code: string) => Promise<void> | void;
}

export default function AttendanceCodeInput({ isSubmitting, onSubmit }: Props) {
  const [code, setCode] = useState("");

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(code.trim());
      }}
    >
      <label className="block text-sm font-medium text-slate-700">
        Attendance Code
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Enter attendance code"
          autoComplete="off"
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500"
        />
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-emerald-600 px-3 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Marking attendance..." : "Mark Attendance"}
      </button>
    </form>
  );
}

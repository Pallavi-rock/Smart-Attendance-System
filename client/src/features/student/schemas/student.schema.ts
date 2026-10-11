import { z } from "zod";

export const attendanceCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Attendance code is required")
    .min(6, "Attendance code must be 6 characters long")
    .max(6, "Attendance code must be 6 characters long")
    .regex(/^[A-Z0-9]+$/i, "Attendance code can only contain letters and numbers"),
});

export type AttendanceCodeFormValues = z.infer<typeof attendanceCodeSchema>;

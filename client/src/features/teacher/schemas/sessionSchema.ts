import { z } from "zod";

export const sessionSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required"),
  classId: z.string().trim().min(1, "Class is required"),
  sessionDate: z
    .string()
    .trim()
    .min(1, "Session date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Session date must be valid",
    }),
  startTime: z.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must be valid"),
  durationMinutes: z.coerce
    .number()
    .int("Duration must be a valid number")
    .min(1, "Duration must be greater than zero")
    .max(480, "Duration must be 480 minutes or less"),
  attendanceMethod: z.enum(["qr", "code", "both"]).default("both"),
  latitude: z.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
});

export type SessionFormValues = z.infer<typeof sessionSchema>;

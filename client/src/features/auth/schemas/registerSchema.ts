import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters"),

    email: z
      .string()
      .email("Invalid email address"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),

    confirmPassword: z
      .string()
      .min(6, "Confirm your password"),
    accountType: z.enum(["student", "teacher"]),
    department: z.string().trim().optional(),
    semester: z.string().trim().optional(),
    classId: z.string().trim().optional(),
    employeeId: z.string().trim().optional(),
    subjects: z.string().trim().optional(),

  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((data, context) => {
    const requiredFields: Array<[string, string | undefined]> = data.accountType === "student"
      ? [["department", data.department], ["semester", data.semester]]
      : [["department", data.department], ["employeeId", data.employeeId], ["subjects", data.subjects]];
    for (const [field, value] of requiredFields) {
      if (!value) context.addIssue({ code: "custom", path: [field], message: "This field is required" });
    }
    if (data.accountType === "student" && !data.classId) {
      context.addIssue({ code: "custom", path: ["classId"], message: "This field is required" });
    }
  });

export type RegisterSchemaType = z.infer<typeof registerSchema>;
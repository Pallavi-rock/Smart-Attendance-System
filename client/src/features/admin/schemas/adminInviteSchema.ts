import { z } from "zod";

export const adminInviteSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(120),
  email: z.string().trim().email("Enter a valid email address"),
});

export type AdminInviteSchemaType = z.infer<typeof adminInviteSchema>;
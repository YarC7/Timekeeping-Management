import { z } from "zod";

export const registerFaceSchema = z.object({
  employee_id: z.string().uuid(),
  embedding: z.array(z.number()), // lưu JSON array
  image_url: z.string().url().optional(),
});

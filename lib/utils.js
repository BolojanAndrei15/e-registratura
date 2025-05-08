import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { z } from "zod";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const departmentSchema = z.object({
  nume: z.string().min(1, "Numele este obligatoriu"),
  descriere: z.string().optional(),
});

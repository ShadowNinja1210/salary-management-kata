import { z } from "zod"
import type { CreateEmployeeInput } from "./types"

export const createEmployeeSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  country: z.string().min(1, "Country is required"),
  salary: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid salary format (e.g., 1000.50)"),
})

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(1).optional(),
  jobTitle: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  salary: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
})

export function validateEmployee(data: CreateEmployeeInput): { valid: boolean; error?: string } {
  if (!data.fullName || data.fullName.trim().length === 0) {
    return { valid: false, error: "Full name is required" }
  }
  if (!data.jobTitle || data.jobTitle.trim().length === 0) {
    return { valid: false, error: "Job title is required" }
  }
  if (!data.country || data.country.trim().length === 0) {
    return { valid: false, error: "Country is required" }
  }
  if (typeof data.salary !== "number" || data.salary <= 0 || isNaN(data.salary)) {
    return { valid: false, error: "Salary must be a positive number" }
  }
  return { valid: true }
}

export type CreateEmployeeSchemaInput = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>

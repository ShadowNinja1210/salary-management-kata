import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// GET /api/employees/metrics/job-title - Get average salary by job title
export async function GET() {
  try {
    const result = await sql`
      SELECT 
        "jobTitle",
        AVG(salary) as "avgSalary",
        COUNT(*) as "employeeCount"
      FROM "Employee"
      GROUP BY "jobTitle"
      ORDER BY "avgSalary" DESC
    `

    const metrics = result.map((row) => ({
      jobTitle: row.jobTitle,
      avgSalary: Number(Number(row.avgSalary).toFixed(2)),
      employeeCount: Number(row.employeeCount),
    }))

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error fetching job title metrics:", error)
    return NextResponse.json({ error: "Failed to fetch job title metrics" }, { status: 500 })
  }
}

import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// GET /api/employees/metrics/country - Get salary stats by country
export async function GET() {
  try {
    const result = await sql`
      SELECT 
        country,
        MIN(salary) as "minSalary",
        MAX(salary) as "maxSalary",
        AVG(salary) as "avgSalary",
        COUNT(*) as "employeeCount"
      FROM "Employee"
      GROUP BY country
      ORDER BY country
    `

    const metrics = result.map((row) => ({
      country: row.country,
      minSalary: Number(row.minSalary),
      maxSalary: Number(row.maxSalary),
      avgSalary: Number(Number(row.avgSalary).toFixed(2)),
      employeeCount: Number(row.employeeCount),
    }))

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error fetching country metrics:", error)
    return NextResponse.json({ error: "Failed to fetch country metrics" }, { status: 500 })
  }
}

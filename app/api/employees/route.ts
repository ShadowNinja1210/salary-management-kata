import { sql } from "@/lib/db"
import { validateEmployee } from "@/lib/validators"
import { calculateNetSalary } from "@/lib/salary-service"
import type { Employee, CreateEmployeeInput } from "@/lib/types"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/employees - Get all employees
export async function GET() {
  try {
    const employees = await sql`
      SELECT id, "fullName", "jobTitle", country, salary, "createdAt"
      FROM "Employee"
      ORDER BY id DESC
    `

    // Add net salary calculation to each employee
    const employeesWithNetSalary = employees.map((emp) => ({
      ...emp,
      netSalary: calculateNetSalary(Number(emp.salary), emp.country),
    }))

    return NextResponse.json(employeesWithNetSalary)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

// POST /api/employees - Create a new employee
export async function POST(request: NextRequest) {
  try {
    const body: CreateEmployeeInput = await request.json()

    // Validate input
    const validation = validateEmployee(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { fullName, jobTitle, country, salary } = body

    const result = await sql`
      INSERT INTO "Employee" ("fullName", "jobTitle", country, salary)
      VALUES (${fullName}, ${jobTitle}, ${country}, ${salary})
      RETURNING id, "fullName", "jobTitle", country, salary, "createdAt"
    `

    const employee = result[0] as Employee
    const netSalary = calculateNetSalary(Number(employee.salary), employee.country)

    return NextResponse.json({ ...employee, netSalary }, { status: 201 })
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}

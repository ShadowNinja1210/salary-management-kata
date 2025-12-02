import { sql } from "@/lib/db"
import { validateEmployee } from "@/lib/validators"
import { calculateNetSalary } from "@/lib/salary-service"
import type { Employee, CreateEmployeeInput } from "@/lib/types"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/employees/:id - Get employee by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const employeeId = Number.parseInt(id, 10)

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
    }

    const result = await sql`
      SELECT id, "fullName", "jobTitle", country, salary, "createdAt"
      FROM "Employee"
      WHERE id = ${employeeId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const employee = result[0] as Employee
    const netSalary = calculateNetSalary(Number(employee.salary), employee.country)

    return NextResponse.json({ ...employee, netSalary })
  } catch (error) {
    console.error("Error fetching employee:", error)
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 })
  }
}

// PUT /api/employees/:id - Update employee
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const employeeId = Number.parseInt(id, 10)

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
    }

    const body: CreateEmployeeInput = await request.json()

    // Validate input
    const validation = validateEmployee(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { fullName, jobTitle, country, salary } = body

    const result = await sql`
      UPDATE "Employee"
      SET "fullName" = ${fullName}, "jobTitle" = ${jobTitle}, country = ${country}, salary = ${salary}
      WHERE id = ${employeeId}
      RETURNING id, "fullName", "jobTitle", country, salary, "createdAt"
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const employee = result[0] as Employee
    const netSalary = calculateNetSalary(Number(employee.salary), employee.country)

    return NextResponse.json({ ...employee, netSalary })
  } catch (error) {
    console.error("Error updating employee:", error)
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 })
  }
}

// DELETE /api/employees/:id - Delete employee
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const employeeId = Number.parseInt(id, 10)

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM "Employee"
      WHERE id = ${employeeId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Employee deleted successfully" })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
}

import { sql } from "@/lib/db";
import { validateEmployee } from "@/lib/validators";
import { calculateNetSalary } from "@/lib/salary-service";
import type { Employee, CreateEmployeeInput } from "@/lib/types";
import { type NextRequest, NextResponse } from "next/server";

// GET /api/employees - Get all employees with pagination, search, filters, and sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("limit") || "10", 10))
    );
    const offset = (page - 1) * limit;

    // Search parameter
    const search = searchParams.get("search") || "";

    // Filter parameters
    const country = searchParams.get("country") || "";
    const jobTitle = searchParams.get("jobTitle") || "";
    const minSalary = searchParams.get("minSalary")
      ? parseFloat(searchParams.get("minSalary")!)
      : null;
    const maxSalary = searchParams.get("maxSalary")
      ? parseFloat(searchParams.get("maxSalary")!)
      : null;

    // Sorting parameters
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Validate sortBy to prevent SQL injection
    const validSortFields = [
      "id",
      "fullName",
      "jobTitle",
      "country",
      "salary",
      "createdAt",
    ];
    const actualSortBy = validSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const actualSortOrder = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

    // Build WHERE conditions dynamically
    const conditions: string[] = [];
    const values: any[] = [];

    if (search) {
      conditions.push(
        `("fullName" ILIKE $${values.length + 1} OR "jobTitle" ILIKE $${
          values.length + 1
        } OR country ILIKE $${values.length + 1})`
      );
      values.push(`%${search}%`);
    }

    if (country) {
      conditions.push(`country ILIKE $${values.length + 1}`);
      values.push(country);
    }

    if (jobTitle) {
      conditions.push(`"jobTitle" ILIKE $${values.length + 1}`);
      values.push(jobTitle);
    }

    if (minSalary !== null) {
      conditions.push(`salary >= $${values.length + 1}`);
      values.push(minSalary);
    }

    if (maxSalary !== null) {
      conditions.push(`salary <= $${values.length + 1}`);
      values.push(maxSalary);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Build complete SQL queries as strings
    const countQueryString = `SELECT COUNT(*) as count FROM "Employee" ${whereClause}`;
    const dataQueryString = `
      SELECT id, "fullName", "jobTitle", country, salary, "createdAt"
      FROM "Employee"
      ${whereClause}
      ORDER BY "${actualSortBy}" ${actualSortOrder}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    // Execute queries using Neon's raw query function
    // Since Neon's template literal doesn't support dynamic WHERE clauses well,
    // we need to execute raw SQL
    const countResult: any[] = await (sql as any)(countQueryString, values);
    const total = parseInt(countResult[0].count, 10);

    const employees: any[] = await (sql as any)(dataQueryString, [
      ...values,
      limit,
      offset,
    ]);

    // Add net salary calculation to each employee
    const employeesWithNetSalary = employees.map((emp: any) => ({
      ...emp,
      netSalary: calculateNetSalary(Number(emp.salary), emp.country),
    }));

    // Return paginated response
    return NextResponse.json({
      data: employeesWithNetSalary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create a new employee
export async function POST(request: NextRequest) {
  try {
    const body: CreateEmployeeInput = await request.json();

    // Validate input
    const validation = validateEmployee(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { fullName, jobTitle, country, salary } = body;

    const result = await sql`
      INSERT INTO "Employee" ("fullName", "jobTitle", country, salary)
      VALUES (${fullName}, ${jobTitle}, ${country}, ${salary})
      RETURNING id, "fullName", "jobTitle", country, salary, "createdAt"
    `;

    const employee = result[0] as Employee;
    const netSalary = calculateNetSalary(
      Number(employee.salary),
      employee.country
    );

    return NextResponse.json({ ...employee, netSalary }, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}

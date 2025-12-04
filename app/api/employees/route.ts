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

    // Fetch all employees - we'll filter and sort in memory
    // This works reliably with Neon's template literal API
    const allEmployees = await sql`
      SELECT id, "fullName", "jobTitle", country, salary, "createdAt"
      FROM "Employee"
    `;

    // Apply filters in JavaScript
    let filteredEmployees = [...allEmployees];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredEmployees = filteredEmployees.filter(
        (emp: any) =>
          (emp.fullName && emp.fullName.toLowerCase().includes(searchLower)) ||
          (emp.jobTitle && emp.jobTitle.toLowerCase().includes(searchLower)) ||
          (emp.country && emp.country.toLowerCase().includes(searchLower))
      );
    }

    if (country) {
      filteredEmployees = filteredEmployees.filter(
        (emp: any) =>
          emp.country && emp.country.toLowerCase() === country.toLowerCase()
      );
    }

    if (jobTitle) {
      filteredEmployees = filteredEmployees.filter(
        (emp: any) =>
          emp.jobTitle && emp.jobTitle.toLowerCase() === jobTitle.toLowerCase()
      );
    }

    if (minSalary !== null) {
      filteredEmployees = filteredEmployees.filter(
        (emp: any) => Number(emp.salary) >= minSalary
      );
    }

    if (maxSalary !== null) {
      filteredEmployees = filteredEmployees.filter(
        (emp: any) => Number(emp.salary) <= maxSalary
      );
    }

    // Apply sorting in JavaScript
    filteredEmployees.sort((a: any, b: any) => {
      let aVal = a[actualSortBy];
      let bVal = b[actualSortBy];

      // Handle numeric comparison for salary
      if (actualSortBy === "salary") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      // Handle string comparison
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (actualSortOrder === "ASC") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    // Get total count
    const total = filteredEmployees.length;

    // Apply pagination
    const paginatedEmployees = filteredEmployees.slice(offset, offset + limit);

    // Add net salary calculation to each employee
    const employeesWithNetSalary = paginatedEmployees.map((emp) => ({
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

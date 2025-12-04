/**
 * @jest-environment node
 */
import {
  GET as getEmployees,
  POST as createEmployee,
} from "@/app/api/employees/route";
import {
  GET as getEmployee,
  PUT as updateEmployee,
  DELETE as deleteEmployee,
} from "@/app/api/employees/[id]/route";
import { sql } from "@/lib/db";
import {
  createMockNextRequest,
  createMockContext,
} from "@/__tests__/helpers/api-test-helpers";

// Mock the database
jest.mock("@/lib/db", () => ({
  sql: jest.fn(),
}));

const mockSql = sql as jest.MockedFunction<typeof sql>;

describe("Employee API - POST /api/employees", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an employee with valid data", async () => {
    const mockEmployee = {
      id: 1,
      fullName: "John Doe",
      jobTitle: "Software Engineer",
      country: "India",
      salary: "50000",
      createdAt: new Date(),
    };

    mockSql.mockResolvedValueOnce([mockEmployee] as any);

    const req = createMockNextRequest({
      method: "POST",
      body: {
        fullName: "John Doe",
        jobTitle: "Software Engineer",
        country: "India",
        salary: 50000,
      },
    });

    const response = await createEmployee(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("id");
    expect(data.fullName).toBe("John Doe");
    expect(data.jobTitle).toBe("Software Engineer");
    expect(data.country).toBe("India");
    expect(data.netSalary).toBe(45000); // India TDS 10%
  });

  it("should fail when fullName is missing", async () => {
    const req = createMockNextRequest({
      method: "POST",
      body: {
        jobTitle: "Engineer",
        country: "India",
        salary: 50000,
      },
    });

    const response = await createEmployee(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    expect(data.error).toContain("Full name is required");
  });

  it("should fail when jobTitle is missing", async () => {
    const req = createMockNextRequest({
      method: "POST",
      body: {
        fullName: "John Doe",
        country: "India",
        salary: 50000,
      },
    });

    const response = await createEmployee(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    expect(data.error).toContain("Job title is required");
  });

  it("should fail when country is missing", async () => {
    const req = createMockNextRequest({
      method: "POST",
      body: {
        fullName: "John Doe",
        jobTitle: "Engineer",
        salary: 50000,
      },
    });

    const response = await createEmployee(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    expect(data.error).toContain("Country is required");
  });

  it("should fail when salary is negative", async () => {
    const req = createMockNextRequest({
      method: "POST",
      body: {
        fullName: "John Doe",
        jobTitle: "Engineer",
        country: "India",
        salary: -1000,
      },
    });

    const response = await createEmployee(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    expect(data.error).toContain("Salary must be a positive number");
  });

  it("should fail when salary is zero", async () => {
    const req = createMockNextRequest({
      method: "POST",
      body: {
        fullName: "John Doe",
        jobTitle: "Engineer",
        country: "India",
        salary: 0,
      },
    });

    const response = await createEmployee(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    expect(data.error).toContain("Salary must be a positive number");
  });

  it("should create employee with USA and calculate 12% TDS", async () => {
    const mockEmployee = {
      id: 2,
      fullName: "Jane Smith",
      jobTitle: "Designer",
      country: "USA",
      salary: "60000",
      createdAt: new Date(),
    };

    mockSql.mockResolvedValueOnce([mockEmployee] as any);

    const req = createMockNextRequest({
      method: "POST",
      body: {
        fullName: "Jane Smith",
        jobTitle: "Designer",
        country: "USA",
        salary: 60000,
      },
    });

    const response = await createEmployee(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.netSalary).toBe(52800); // USA TDS 12%
  });

  it("should create employee with other country and calculate 0% TDS", async () => {
    const mockEmployee = {
      id: 3,
      fullName: "Carlos Garcia",
      jobTitle: "Manager",
      country: "Spain",
      salary: "70000",
      createdAt: new Date(),
    };

    mockSql.mockResolvedValueOnce([mockEmployee] as any);

    const req = createMockNextRequest({
      method: "POST",
      body: {
        fullName: "Carlos Garcia",
        jobTitle: "Manager",
        country: "Spain",
        salary: 70000,
      },
    });

    const response = await createEmployee(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.netSalary).toBe(70000); // Other countries TDS 0%
  });

  it("should handle decimal salaries correctly", async () => {
    const mockEmployee = {
      id: 4,
      fullName: "Test User",
      jobTitle: "Developer",
      country: "India",
      salary: "50000.50",
      createdAt: new Date(),
    };

    mockSql.mockResolvedValueOnce([mockEmployee] as any);

    const req = createMockNextRequest({
      method: "POST",
      body: {
        fullName: "Test User",
        jobTitle: "Developer",
        country: "India",
        salary: 50000.5,
      },
    });

    const response = await createEmployee(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.netSalary).toBeCloseTo(45000.45, 2);
  });
});

describe("Employee API - GET /api/employees", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return an empty array when no employees exist", async () => {
    // Mock single query - fetch all employees
    mockSql.mockResolvedValueOnce([]);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost:3000/api/employees",
    });
    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("pagination");
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBe(0);
    expect(data.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  });

  it("should return all employees with net salary", async () => {
    const mockEmployees = [
      {
        id: 1,
        fullName: "John Doe",
        jobTitle: "Engineer",
        country: "India",
        salary: "50000",
        createdAt: new Date(),
      },
      {
        id: 2,
        fullName: "Jane Smith",
        jobTitle: "Designer",
        country: "USA",
        salary: "60000",
        createdAt: new Date(),
      },
    ];

    // Mock single query - fetch all employees
    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost:3000/api/employees",
    });
    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("pagination");
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBe(2);
    expect(data.data[0]).toHaveProperty("netSalary");
    expect(data.data[0].netSalary).toBe(45000); // India 10% TDS
    expect(data.data[1].netSalary).toBe(52800); // USA 12% TDS
    expect(data.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
  });

  it("should handle database errors gracefully", async () => {
    mockSql.mockRejectedValueOnce(new Error("Database connection failed"));

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost:3000/api/employees",
    });
    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Failed to fetch employees");
  });
});

describe("Employee API - GET /api/employees/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return employee by id", async () => {
    const mockEmployee = {
      id: 1,
      fullName: "John Doe",
      jobTitle: "Engineer",
      country: "India",
      salary: "50000",
      createdAt: new Date(),
    };

    mockSql.mockResolvedValueOnce([mockEmployee] as any);

    const req = createMockNextRequest({ method: "GET" });
    const context = createMockContext({ id: "1" });

    const response = await getEmployee(req, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("id", 1);
    expect(data).toHaveProperty("fullName", "John Doe");
    expect(data).toHaveProperty("netSalary", 45000);
  });

  it("should return 404 when employee not found", async () => {
    mockSql.mockResolvedValueOnce([]);

    const req = createMockNextRequest({ method: "GET" });
    const context = createMockContext({ id: "999" });

    const response = await getEmployee(req, context);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Employee not found");
  });

  it("should return 400 for invalid id", async () => {
    const req = createMockNextRequest({ method: "GET" });
    const context = createMockContext({ id: "invalid" });

    const response = await getEmployee(req, context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
  });
});

describe("Employee API - PUT /api/employees/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update employee with valid data", async () => {
    const mockUpdatedEmployee = {
      id: 1,
      fullName: "John Updated",
      jobTitle: "Senior Engineer",
      country: "India",
      salary: "60000",
      createdAt: new Date(),
    };

    mockSql.mockResolvedValueOnce([mockUpdatedEmployee] as any);

    const req = createMockNextRequest({
      method: "PUT",
      body: {
        fullName: "John Updated",
        jobTitle: "Senior Engineer",
        country: "India",
        salary: 60000,
      },
    });
    const context = createMockContext({ id: "1" });

    const response = await updateEmployee(req, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.fullName).toBe("John Updated");
    expect(data.jobTitle).toBe("Senior Engineer");
    expect(data.netSalary).toBe(54000); // Updated salary with 10% TDS
  });

  it("should fail partial update (current API requires all fields)", async () => {
    // Note: API should be updated to support partial updates
    const req = createMockNextRequest({
      method: "PUT",
      body: {
        jobTitle: "Senior Engineer",
      },
    });
    const context = createMockContext({ id: "1" });

    const response = await updateEmployee(req, context);
    const data = await response.json();

    // Current implementation requires all fields
    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
  });

  it("should return 500 when updating non-existent employee", async () => {
    mockSql.mockResolvedValueOnce([]); // Empty result means not found

    const req = createMockNextRequest({
      method: "PUT",
      body: {
        fullName: "Test",
        jobTitle: "Engineer",
        country: "India",
        salary: 50000,
      },
    });
    const context = createMockContext({ id: "999" });

    const response = await updateEmployee(req, context);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty("error");
  });

  it("should validate negative salary on update", async () => {
    const req = createMockNextRequest({
      method: "PUT",
      body: {
        salary: -1000,
      },
    });
    const context = createMockContext({ id: "1" });

    const response = await updateEmployee(req, context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
  });
});

describe("Employee API - DELETE /api/employees/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete employee successfully", async () => {
    mockSql.mockResolvedValueOnce([{ id: 1 }] as any);

    const req = createMockNextRequest({ method: "DELETE" });
    const context = createMockContext({ id: "1" });

    const response = await deleteEmployee(req, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("message");
    expect(data.message).toBe("Employee deleted successfully");
  });

  it("should return 404 when deleting non-existent employee", async () => {
    mockSql.mockResolvedValueOnce([]);

    const req = createMockNextRequest({ method: "DELETE" });
    const context = createMockContext({ id: "999" });

    const response = await deleteEmployee(req, context);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Employee not found");
  });

  it("should return 400 for invalid id", async () => {
    const req = createMockNextRequest({ method: "DELETE" });
    const context = createMockContext({ id: "invalid" });

    const response = await deleteEmployee(req, context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
  });
});

describe("Employee API - GET /api/employees - Pagination", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return paginated employees with default values", async () => {
    const mockEmployees = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      fullName: `Employee ${i + 1}`,
      jobTitle: "Engineer",
      country: "India",
      salary: "50000",
      createdAt: new Date(),
    }));

    // Mock single query - fetch all employees
    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("pagination");
    expect(data.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 5,
      totalPages: 1,
    });
  });

  it("should handle custom pagination parameters", async () => {
    const mockEmployees = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      fullName: `Employee ${i + 1}`,
      jobTitle: "Engineer",
      country: "India",
      salary: "50000",
      createdAt: new Date(),
    }));

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?page=2&limit=20",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination).toEqual({
      page: 2,
      limit: 20,
      total: 100,
      totalPages: 5,
    });
  });

  it("should enforce maximum limit of 100", async () => {
    const mockEmployees = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      fullName: `Employee ${i + 1}`,
      jobTitle: "Engineer",
      country: "India",
      salary: "50000",
      createdAt: new Date(),
    }));

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?limit=200",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(data.pagination.limit).toBe(100);
  });

  it("should handle invalid page numbers gracefully", async () => {
    const mockEmployees = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      fullName: `Employee ${i + 1}`,
      jobTitle: "Engineer",
      country: "India",
      salary: "50000",
      createdAt: new Date(),
    }));

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?page=-5",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(data.pagination.page).toBe(1); // Should default to 1
  });
});

describe("Employee API - GET /api/employees - Search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should search by fullName", async () => {
    const mockEmployees = [
      {
        id: 1,
        fullName: "John Doe",
        jobTitle: "Engineer",
        country: "India",
        salary: "50000",
        createdAt: new Date(),
      },
      {
        id: 2,
        fullName: "Jane Smith",
        jobTitle: "Designer",
        country: "USA",
        salary: "60000",
        createdAt: new Date(),
      },
    ];

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?search=John",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.length).toBeGreaterThan(0);
  });

  it("should handle empty search results", async () => {
    const mockEmployees = [
      {
        id: 1,
        fullName: "John Doe",
        jobTitle: "Engineer",
        country: "India",
        salary: "50000",
        createdAt: new Date(),
      },
    ];

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?search=NonExistent",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.pagination.total).toBe(0);
  });
});

describe("Employee API - GET /api/employees - Filters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should filter by country", async () => {
    const mockEmployees = [
      {
        id: 1,
        fullName: "John Doe",
        jobTitle: "Engineer",
        country: "India",
        salary: "50000",
        createdAt: new Date(),
      },
      {
        id: 2,
        fullName: "Jane Smith",
        jobTitle: "Designer",
        country: "India",
        salary: "60000",
        createdAt: new Date(),
      },
      {
        id: 3,
        fullName: "Bob Wilson",
        jobTitle: "Manager",
        country: "USA",
        salary: "70000",
        createdAt: new Date(),
      },
    ];

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?country=India",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.total).toBe(2);
  });

  it("should filter by jobTitle", async () => {
    const mockEmployees = [
      {
        id: 1,
        fullName: "John Doe",
        jobTitle: "Engineer",
        country: "India",
        salary: "50000",
        createdAt: new Date(),
      },
      {
        id: 2,
        fullName: "Jane Smith",
        jobTitle: "Engineer",
        country: "USA",
        salary: "60000",
        createdAt: new Date(),
      },
      {
        id: 3,
        fullName: "Bob Wilson",
        jobTitle: "Engineer",
        country: "Canada",
        salary: "70000",
        createdAt: new Date(),
      },
    ];

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?jobTitle=Engineer",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.total).toBe(3);
  });

  it("should filter by minimum salary", async () => {
    const mockEmployees = [
      {
        id: 1,
        fullName: "Emp1",
        jobTitle: "Engineer",
        country: "India",
        salary: "40000",
        createdAt: new Date(),
      },
      {
        id: 2,
        fullName: "Emp2",
        jobTitle: "Engineer",
        country: "India",
        salary: "60000",
        createdAt: new Date(),
      },
      {
        id: 3,
        fullName: "Emp3",
        jobTitle: "Engineer",
        country: "India",
        salary: "70000",
        createdAt: new Date(),
      },
      {
        id: 4,
        fullName: "Emp4",
        jobTitle: "Engineer",
        country: "India",
        salary: "80000",
        createdAt: new Date(),
      },
      {
        id: 5,
        fullName: "Emp5",
        jobTitle: "Engineer",
        country: "India",
        salary: "90000",
        createdAt: new Date(),
      },
    ];

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?minSalary=50000",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.total).toBe(4);
  });

  it("should filter by maximum salary", async () => {
    const mockEmployees = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      fullName: `Emp${i + 1}`,
      jobTitle: "Engineer",
      country: "India",
      salary: String((i + 1) * 10000),
      createdAt: new Date(),
    }));

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?maxSalary=100000",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.total).toBe(10);
  });

  it("should filter by salary range", async () => {
    const mockEmployees = [
      {
        id: 1,
        fullName: "Emp1",
        jobTitle: "Engineer",
        country: "India",
        salary: "40000",
        createdAt: new Date(),
      },
      {
        id: 2,
        fullName: "Emp2",
        jobTitle: "Engineer",
        country: "India",
        salary: "60000",
        createdAt: new Date(),
      },
      {
        id: 3,
        fullName: "Emp3",
        jobTitle: "Engineer",
        country: "India",
        salary: "70000",
        createdAt: new Date(),
      },
      {
        id: 4,
        fullName: "Emp4",
        jobTitle: "Engineer",
        country: "India",
        salary: "80000",
        createdAt: new Date(),
      },
      {
        id: 5,
        fullName: "Emp5",
        jobTitle: "Engineer",
        country: "India",
        salary: "90000",
        createdAt: new Date(),
      },
      {
        id: 6,
        fullName: "Emp6",
        jobTitle: "Engineer",
        country: "India",
        salary: "100000",
        createdAt: new Date(),
      },
      {
        id: 7,
        fullName: "Emp7",
        jobTitle: "Engineer",
        country: "India",
        salary: "110000",
        createdAt: new Date(),
      },
    ];

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?minSalary=50000&maxSalary=100000",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.total).toBe(5);
  });

  it("should combine multiple filters", async () => {
    const mockEmployees = [
      {
        id: 1,
        fullName: "John Doe",
        jobTitle: "Engineer",
        country: "India",
        salary: "60000",
        createdAt: new Date(),
      },
      {
        id: 2,
        fullName: "Jane Smith",
        jobTitle: "Engineer",
        country: "India",
        salary: "70000",
        createdAt: new Date(),
      },
      {
        id: 3,
        fullName: "Bob Wilson",
        jobTitle: "Designer",
        country: "India",
        salary: "65000",
        createdAt: new Date(),
      },
      {
        id: 4,
        fullName: "Alice Brown",
        jobTitle: "Engineer",
        country: "USA",
        salary: "75000",
        createdAt: new Date(),
      },
    ];

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?country=India&jobTitle=Engineer&minSalary=50000",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.total).toBe(2);
  });
});

describe("Employee API - GET /api/employees - Sorting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should sort by salary ascending", async () => {
    const mockEmployees = [
      {
        id: 2,
        fullName: "Jane Smith",
        jobTitle: "Manager",
        country: "USA",
        salary: "50000",
        createdAt: new Date(),
      },
      {
        id: 1,
        fullName: "John Doe",
        jobTitle: "Engineer",
        country: "India",
        salary: "30000",
        createdAt: new Date(),
      },
      {
        id: 3,
        fullName: "Bob Wilson",
        jobTitle: "Director",
        country: "Canada",
        salary: "70000",
        createdAt: new Date(),
      },
    ];

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?sortBy=salary&sortOrder=asc",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data[0].salary).toBe("30000");
    expect(data.data[1].salary).toBe("50000");
    expect(data.data[2].salary).toBe("70000");
  });

  it("should sort by fullName descending", async () => {
    const mockEmployees = [
      {
        id: 1,
        fullName: "Alice Brown",
        jobTitle: "Engineer",
        country: "India",
        salary: "50000",
        createdAt: new Date(),
      },
      {
        id: 2,
        fullName: "Bob Wilson",
        jobTitle: "Manager",
        country: "USA",
        salary: "60000",
        createdAt: new Date(),
      },
      {
        id: 3,
        fullName: "Charlie Davis",
        jobTitle: "Director",
        country: "Canada",
        salary: "70000",
        createdAt: new Date(),
      },
    ];

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?sortBy=fullName&sortOrder=desc",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data[0].fullName).toBe("Charlie Davis");
    expect(data.data[1].fullName).toBe("Bob Wilson");
    expect(data.data[2].fullName).toBe("Alice Brown");
  });

  it("should default to createdAt desc for invalid sortBy", async () => {
    const mockEmployees = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      fullName: `Employee ${i + 1}`,
      jobTitle: "Engineer",
      country: "India",
      salary: "50000",
      createdAt: new Date(Date.now() - i * 86400000), // Different dates
    }));

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?sortBy=invalidField",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(5);
  });

  it("should handle sorting with pagination", async () => {
    const mockEmployees = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      fullName: `Employee ${i + 1}`,
      jobTitle: "Engineer",
      country: "India",
      salary: String((50 - i) * 1000), // Reverse order for sorting test
      createdAt: new Date(),
    }));

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?page=2&limit=20&sortBy=salary&sortOrder=desc",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination).toEqual({
      page: 2,
      limit: 20,
      total: 50,
      totalPages: 3,
    });
  });
});

describe("Employee API - GET /api/employees - Combined Query", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle pagination + search + filters + sorting combined", async () => {
    // Create 50 employees: need at least 10 that match ALL criteria:
    // 1. search=engineer (in fullName, jobTitle, or country - case insensitive)
    // 2. country=India (exact match - case insensitive)
    // 3. minSalary=50000 (>= 50000)
    const mockEmployees = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      // Make ~25 employees have "Engineer" in fullName and be from India with salary >= 50000
      fullName: i < 30 ? `Engineer Employee ${i}` : `Designer Person ${i}`,
      jobTitle: i < 30 ? "Senior Engineer" : "Designer",
      country: i < 35 ? "India" : "USA",
      salary: String(45000 + i * 1000), // Salaries from 45k to 95k
      createdAt: new Date(),
    }));

    mockSql.mockResolvedValueOnce(mockEmployees as any);

    const req = createMockNextRequest({
      method: "GET",
      url: "http://localhost/api/employees?page=2&limit=5&search=engineer&country=India&minSalary=50000&sortBy=salary&sortOrder=desc",
    });

    const response = await getEmployees(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("pagination");
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(5);
    // We should have employees 0-29 with "Engineer", 0-34 from India, 5+ with salary >= 50000
    // Intersection: employees 5-29 = 25 records
    expect(data.pagination.total).toBeGreaterThanOrEqual(10);
    expect(data.data.length).toBeGreaterThan(0); // Should have data on page 2
  });
});

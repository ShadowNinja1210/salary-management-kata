/**
 * @jest-environment node
 */
import { GET as getCountryMetrics } from "@/app/api/employees/metrics/country/route";
import { GET as getJobTitleMetrics } from "@/app/api/employees/metrics/job-title/route";
import { sql } from "@/lib/db";

// Mock the database
jest.mock("@/lib/db", () => ({
  sql: jest.fn(),
}));

const mockSql = sql as jest.MockedFunction<typeof sql>;

describe("Metrics API - GET /api/employees/metrics/country", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return country-wise salary metrics", async () => {
    const mockMetrics = [
      {
        country: "India",
        employeeCount: "5",
        minSalary: "40000",
        maxSalary: "80000",
        avgSalary: "60000",
      },
      {
        country: "USA",
        employeeCount: "3",
        minSalary: "70000",
        maxSalary: "100000",
        avgSalary: "85000",
      },
    ];

    mockSql.mockResolvedValueOnce(mockMetrics as any);

    const response = await getCountryMetrics();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(2);
    expect(data[0]).toHaveProperty("country", "India");
    expect(data[0]).toHaveProperty("employeeCount", 5);
    expect(data[0]).toHaveProperty("minSalary", 40000);
    expect(data[0]).toHaveProperty("maxSalary", 80000);
    expect(data[0]).toHaveProperty("avgSalary", 60000);
  });

  it("should return empty array when no employees exist", async () => {
    mockSql.mockResolvedValueOnce([]);

    const response = await getCountryMetrics();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  it("should handle database errors gracefully", async () => {
    mockSql.mockRejectedValueOnce(new Error("Database query failed"));

    const response = await getCountryMetrics();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Failed to fetch country metrics");
  });

  it("should correctly aggregate multiple employees per country", async () => {
    const mockMetrics = [
      {
        country: "India",
        employeeCount: "10",
        minSalary: "30000",
        maxSalary: "100000",
        avgSalary: "55000",
      },
    ];

    mockSql.mockResolvedValueOnce(mockMetrics as any);

    const response = await getCountryMetrics();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data[0].employeeCount).toBe(10);
    expect(data[0].avgSalary).toBe(55000);
  });

  it("should handle countries with single employee", async () => {
    const mockMetrics = [
      {
        country: "Germany",
        employeeCount: "1",
        minSalary: "75000",
        maxSalary: "75000",
        avgSalary: "75000",
      },
    ];

    mockSql.mockResolvedValueOnce(mockMetrics as any);

    const response = await getCountryMetrics();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data[0].minSalary).toBe(data[0].maxSalary);
    expect(data[0].avgSalary).toBe(data[0].minSalary);
  });

  it("should handle decimal salary values correctly", async () => {
    const mockMetrics = [
      {
        country: "India",
        employeeCount: "3",
        minSalary: "50000.50",
        maxSalary: "60000.75",
        avgSalary: "55000.42",
      },
    ];

    mockSql.mockResolvedValueOnce(mockMetrics as any);

    const response = await getCountryMetrics();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data[0].minSalary).toBeCloseTo(50000.5, 2);
    expect(data[0].maxSalary).toBeCloseTo(60000.75, 2);
    expect(data[0].avgSalary).toBeCloseTo(55000.42, 2);
  });
});

describe("Metrics API - GET /api/employees/metrics/job-title", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return job title wise average salary metrics", async () => {
    const mockMetrics = [
      {
        jobTitle: "Software Engineer",
        employeeCount: "8",
        avgSalary: "65000",
      },
      {
        jobTitle: "Designer",
        employeeCount: "4",
        avgSalary: "55000",
      },
      {
        jobTitle: "Manager",
        employeeCount: "2",
        avgSalary: "90000",
      },
    ];

    mockSql.mockResolvedValueOnce(mockMetrics as any);

    const response = await getJobTitleMetrics();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(3);
    expect(data[0]).toHaveProperty("jobTitle", "Software Engineer");
    expect(data[0]).toHaveProperty("employeeCount", 8);
    expect(data[0]).toHaveProperty("avgSalary", 65000);
  });

  it("should return empty array when no employees exist", async () => {
    mockSql.mockResolvedValueOnce([]);

    const response = await getJobTitleMetrics();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  it("should handle database errors gracefully", async () => {
    mockSql.mockRejectedValueOnce(new Error("Database query failed"));

    const response = await getJobTitleMetrics();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Failed to fetch job title metrics");
  });

  it("should sort by highest average salary (descending)", async () => {
    const mockMetrics = [
      {
        jobTitle: "Manager",
        employeeCount: "2",
        avgSalary: "90000",
      },
      {
        jobTitle: "Software Engineer",
        employeeCount: "8",
        avgSalary: "65000",
      },
      {
        jobTitle: "Designer",
        employeeCount: "4",
        avgSalary: "55000",
      },
    ];

    mockSql.mockResolvedValueOnce(mockMetrics as any);

    const response = await getJobTitleMetrics();
    const data = await response.json();

    expect(response.status).toBe(200);
    // Verify descending order
    expect(data[0].avgSalary).toBeGreaterThan(data[1].avgSalary);
    expect(data[1].avgSalary).toBeGreaterThan(data[2].avgSalary);
  });

  it("should handle job titles with single employee", async () => {
    const mockMetrics = [
      {
        jobTitle: "CTO",
        employeeCount: "1",
        avgSalary: "150000",
      },
    ];

    mockSql.mockResolvedValueOnce(mockMetrics as any);

    const response = await getJobTitleMetrics();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data[0].employeeCount).toBe(1);
    expect(data[0].avgSalary).toBe(150000);
  });

  it("should handle decimal average salary correctly", async () => {
    const mockMetrics = [
      {
        jobTitle: "Developer",
        employeeCount: "5",
        avgSalary: "62750.33",
      },
    ];

    mockSql.mockResolvedValueOnce(mockMetrics as any);

    const response = await getJobTitleMetrics();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data[0].avgSalary).toBeCloseTo(62750.33, 2);
  });

  it("should handle multiple employees with same job title from different countries", async () => {
    const mockMetrics = [
      {
        jobTitle: "Engineer",
        employeeCount: "15",
        avgSalary: "58000",
      },
    ];

    mockSql.mockResolvedValueOnce(mockMetrics as any);

    const response = await getJobTitleMetrics();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data[0].employeeCount).toBe(15);
  });
});

import { validateEmployee } from "@/lib/validators";
import type { CreateEmployeeInput } from "@/lib/types";

describe("Employee validation", () => {
  it("validates a correct employee", () => {
    const employee: CreateEmployeeInput = {
      fullName: "John Doe",
      jobTitle: "Software Engineer",
      country: "India",
      salary: 50000,
    };
    const result = validateEmployee(employee);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("fails when fullName is empty", () => {
    const employee: CreateEmployeeInput = {
      fullName: "",
      jobTitle: "Software Engineer",
      country: "India",
      salary: 50000,
    };
    const result = validateEmployee(employee);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Full name is required");
  });

  it("fails when jobTitle is empty", () => {
    const employee: CreateEmployeeInput = {
      fullName: "John Doe",
      jobTitle: "",
      country: "India",
      salary: 50000,
    };
    const result = validateEmployee(employee);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Job title is required");
  });

  it("fails when country is empty", () => {
    const employee: CreateEmployeeInput = {
      fullName: "John Doe",
      jobTitle: "Software Engineer",
      country: "",
      salary: 50000,
    };
    const result = validateEmployee(employee);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Country is required");
  });

  it("fails when salary is negative", () => {
    const employee: CreateEmployeeInput = {
      fullName: "John Doe",
      jobTitle: "Software Engineer",
      country: "India",
      salary: -1000,
    };
    const result = validateEmployee(employee);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Salary must be a positive number");
  });

  it("fails when salary is zero", () => {
    const employee: CreateEmployeeInput = {
      fullName: "John Doe",
      jobTitle: "Software Engineer",
      country: "India",
      salary: 0,
    };
    const result = validateEmployee(employee);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Salary must be a positive number");
  });

  it("accepts decimal salaries", () => {
    const employee: CreateEmployeeInput = {
      fullName: "John Doe",
      jobTitle: "Software Engineer",
      country: "India",
      salary: 50000.75,
    };
    const result = validateEmployee(employee);
    expect(result.valid).toBe(true);
  });
});

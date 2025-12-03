import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EmployeeTable } from "@/components/employee-table";
import type { Employee } from "@/lib/types";

describe("EmployeeTable", () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const mockEmployees: (Employee & { netSalary: number })[] = [
    {
      id: 1,
      fullName: "John Doe",
      jobTitle: "Software Engineer",
      country: "India",
      salary: 50000,
      netSalary: 45000,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: 2,
      fullName: "Jane Smith",
      jobTitle: "Designer",
      country: "USA",
      salary: 60000,
      netSalary: 52800,
      createdAt: new Date("2024-01-02"),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders table headers correctly", () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByText("Job Title")).toBeInTheDocument();
    expect(screen.getByText("Country")).toBeInTheDocument();
    expect(screen.getByText("Gross Salary")).toBeInTheDocument();
    expect(screen.getByText("TDS Rate")).toBeInTheDocument();
    expect(screen.getByText("Net Salary")).toBeInTheDocument();
  });

  it("renders employee data correctly", () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
  });

  it("displays correct TDS rates for countries", () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // India should show 10%
    const tdsRates = screen.getAllByText(/10%|12%/);
    expect(tdsRates.length).toBeGreaterThan(0);
  });

  it("formats currency correctly", () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check for currency formatting (contains $ and comma)
    expect(screen.getByText(/\$50,000\.00/)).toBeInTheDocument();
    expect(screen.getByText(/\$60,000\.00/)).toBeInTheDocument();
  });

  it("shows empty state when no employees", () => {
    render(
      <EmployeeTable
        employees={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/no employees found/i)).toBeInTheDocument();
  });

  it("renders action menu buttons for each employee", () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Should have dropdown menu buttons
    const dropdownButtons = screen.getAllByRole("button");
    // At least one button per employee for the dropdown
    expect(dropdownButtons.length).toBeGreaterThan(0);
  });

  it("displays net salary prominently", () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Net salaries should be displayed
    expect(screen.getByText(/\$45,000\.00/)).toBeInTheDocument();
    expect(screen.getByText(/\$52,800\.00/)).toBeInTheDocument();
  });

  it("shows correct TDS rate for India (10%)", () => {
    const indiaEmployee: (Employee & { netSalary: number })[] = [
      {
        id: 1,
        fullName: "Test User",
        jobTitle: "Engineer",
        country: "India",
        salary: 100000,
        netSalary: 90000,
        createdAt: new Date(),
      },
    ];

    render(
      <EmployeeTable
        employees={indiaEmployee}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  it("shows correct TDS rate for USA (12%)", () => {
    const usaEmployee: (Employee & { netSalary: number })[] = [
      {
        id: 1,
        fullName: "Test User",
        jobTitle: "Engineer",
        country: "USA",
        salary: 100000,
        netSalary: 88000,
        createdAt: new Date(),
      },
    ];

    render(
      <EmployeeTable
        employees={usaEmployee}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("12%")).toBeInTheDocument();
  });

  it("shows 0% TDS rate for other countries", () => {
    const ukEmployee: (Employee & { netSalary: number })[] = [
      {
        id: 1,
        fullName: "Test User",
        jobTitle: "Engineer",
        country: "UK",
        salary: 100000,
        netSalary: 100000,
        createdAt: new Date(),
      },
    ];

    render(
      <EmployeeTable
        employees={ukEmployee}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});

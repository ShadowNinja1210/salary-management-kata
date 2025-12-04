import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EmployeeManager } from "@/components/employee-manager";
import type { Employee } from "@/lib/types";

// Mock SWR
const mockUseSWR = jest.fn();
jest.mock("swr", () => ({
  __esModule: true,
  default: (...args: any[]) => mockUseSWR(...args),
}));

// Mock child components to simplify testing
jest.mock("@/components/employee-table", () => ({
  EmployeeTable: ({ employees, onEdit, onDelete }: any) => (
    <div data-testid="employee-table">
      <div>Table with {employees.length} employees</div>
      <button onClick={() => onEdit({ id: 1 })}>Edit Employee</button>
      <button onClick={() => onDelete(1)}>Delete Employee</button>
    </div>
  ),
}));

jest.mock("@/components/employee-form", () => ({
  EmployeeForm: ({ open, onOpenChange, employee, onSubmit }: any) => (
    <div
      data-testid="employee-form"
      style={{ display: open ? "block" : "none" }}
    >
      <div>{employee ? "Edit Mode" : "Create Mode"}</div>
      <button
        onClick={() =>
          onSubmit({
            fullName: "Test",
            jobTitle: "Dev",
            country: "India",
            salary: 50000,
          })
        }
      >
        Submit
      </button>
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  ),
}));

describe("EmployeeManager", () => {
  const mockEmployees: (Employee & { netSalary: number })[] = [
    {
      id: 1,
      fullName: "John Doe",
      jobTitle: "Engineer",
      country: "India",
      salary: 50000,
      netSalary: 45000,
      createdAt: new Date(),
    },
    {
      id: 2,
      fullName: "Jane Smith",
      jobTitle: "Designer",
      country: "USA",
      salary: 60000,
      netSalary: 52800,
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
    mockUseSWR.mockReturnValue({
      data: {
        data: mockEmployees,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      },
      error: null,
      mutate: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with employees", () => {
    render(<EmployeeManager />);

    expect(screen.getByText("Employees")).toBeInTheDocument();
    expect(screen.getByText("2 total employees")).toBeInTheDocument();
  });

  it("displays Add Employee button", () => {
    render(<EmployeeManager />);

    expect(screen.getByText("Add Employee")).toBeInTheDocument();
  });

  it("shows loading state when no data", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: null,
      mutate: jest.fn(),
    });

    render(<EmployeeManager />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error state when fetch fails", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: new Error("Failed to fetch"),
      mutate: jest.fn(),
    });

    render(<EmployeeManager />);

    expect(screen.getByText(/failed to load employees/i)).toBeInTheDocument();
  });

  it("opens form when Add Employee is clicked", () => {
    render(<EmployeeManager />);

    const addButton = screen.getByText("Add Employee");
    fireEvent.click(addButton);

    const form = screen.getByTestId("employee-form");
    expect(form).toHaveStyle({ display: "block" });
    expect(screen.getByText("Create Mode")).toBeInTheDocument();
  });

  it("passes employees to table component", () => {
    render(<EmployeeManager />);

    expect(screen.getByText("Table with 2 employees")).toBeInTheDocument();
  });

  it("handles create employee", async () => {
    const mockMutate = jest.fn();
    mockUseSWR.mockReturnValue({
      data: mockEmployees,
      error: null,
      mutate: mockMutate,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 3 }),
    });

    render(<EmployeeManager />);

    // Open form
    fireEvent.click(screen.getByText("Add Employee"));

    // Submit form
    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Test",
          jobTitle: "Dev",
          country: "India",
          salary: 50000,
        }),
      });
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it("handles edit employee", async () => {
    const mockMutate = jest.fn();
    mockUseSWR.mockReturnValue({
      data: mockEmployees,
      error: null,
      mutate: mockMutate,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    render(<EmployeeManager />);

    // Trigger edit from table
    fireEvent.click(screen.getByText("Edit Employee"));

    // Form should be open in edit mode
    expect(screen.getByText("Edit Mode")).toBeInTheDocument();

    // Submit edit
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/employees/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Test",
          jobTitle: "Dev",
          country: "India",
          salary: 50000,
        }),
      });
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it("handles delete employee", async () => {
    const mockMutate = jest.fn();
    mockUseSWR.mockReturnValue({
      data: mockEmployees,
      error: null,
      mutate: mockMutate,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<EmployeeManager />);

    // Trigger delete from table
    fireEvent.click(screen.getByText("Delete Employee"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/employees/1", {
        method: "DELETE",
      });
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it("closes form and clears editing employee when form is closed", () => {
    render(<EmployeeManager />);

    // Open form in edit mode
    fireEvent.click(screen.getByText("Edit Employee"));
    expect(screen.getByText("Edit Mode")).toBeInTheDocument();

    // Close form
    fireEvent.click(screen.getByText("Close"));

    const form = screen.getByTestId("employee-form");
    expect(form).toHaveStyle({ display: "none" });
  });
});

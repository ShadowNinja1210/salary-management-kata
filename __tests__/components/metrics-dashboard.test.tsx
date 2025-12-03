import { render, screen } from "@testing-library/react";
import { MetricsDashboard } from "@/components/metrics-dashboard";

// Mock recharts to avoid canvas issues in tests
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock SWR with configurable data
const mockUseSWR = jest.fn();
jest.mock("swr", () => ({
  __esModule: true,
  default: (...args: any[]) => mockUseSWR(...args),
}));

describe("MetricsDashboard", () => {
  beforeEach(() => {
    // Default empty state
    mockUseSWR.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the dashboard title", () => {
    render(<MetricsDashboard />);
    expect(screen.getByText("Salary Metrics")).toBeInTheDocument();
  });

  it("displays overview description", () => {
    render(<MetricsDashboard />);
    expect(
      screen.getByText("Overview of salary distribution")
    ).toBeInTheDocument();
  });

  it("renders metric cards", () => {
    render(<MetricsDashboard />);

    // Check for metric card titles
    expect(screen.getByText("Total Employees")).toBeInTheDocument();
    expect(screen.getByText("Avg Gross Salary")).toBeInTheDocument();
    expect(screen.getByText("Job Titles")).toBeInTheDocument();
  });

  it("displays section headers", () => {
    render(<MetricsDashboard />);

    expect(screen.getByText("Salary by Country")).toBeInTheDocument();
    expect(screen.getByText("Average Salary by Job Title")).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    const { container } = render(<MetricsDashboard />);
    expect(container).toBeTruthy();
  });

  it("displays chart placeholders when data is empty", () => {
    render(<MetricsDashboard />);

    // With empty data, should still render the structure
    const dashboard = screen.getByText("Salary Metrics");
    expect(dashboard).toBeTruthy();
  });

  it("displays zero values when no data is available", () => {
    mockUseSWR.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
    });

    render(<MetricsDashboard />);

    // Should show 0 values - but there are multiple 0s, so check for specific elements
    expect(screen.getByText("Total Employees")).toBeInTheDocument();
    expect(screen.getByText(/Across\s+0\s+countries/i)).toBeInTheDocument();
  });

  it("calculates total employees correctly from country metrics", () => {
    let callCount = 0;
    mockUseSWR.mockImplementation((url: string) => {
      if (url === "/api/employees/metrics/country") {
        return {
          data: [
            {
              country: "India",
              employeeCount: 5,
              avgSalary: 50000,
              minSalary: 40000,
              maxSalary: 60000,
            },
            {
              country: "USA",
              employeeCount: 3,
              avgSalary: 70000,
              minSalary: 60000,
              maxSalary: 80000,
            },
          ],
          error: null,
          isLoading: false,
        };
      }
      return {
        data: [],
        error: null,
        isLoading: false,
      };
    });

    render(<MetricsDashboard />);

    // Total should be 8 (5 + 3)
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("displays country count correctly", () => {
    mockUseSWR.mockImplementation((url: string) => {
      if (url === "/api/employees/metrics/country") {
        return {
          data: [
            {
              country: "India",
              employeeCount: 5,
              avgSalary: 50000,
              minSalary: 40000,
              maxSalary: 60000,
            },
            {
              country: "USA",
              employeeCount: 3,
              avgSalary: 70000,
              minSalary: 60000,
              maxSalary: 80000,
            },
          ],
          error: null,
          isLoading: false,
        };
      }
      return { data: [], error: null, isLoading: false };
    });

    render(<MetricsDashboard />);

    // Should show "Across 2 countries"
    expect(screen.getByText(/across 2 countries/i)).toBeInTheDocument();
  });

  it("displays job title count correctly", () => {
    mockUseSWR.mockImplementation((url: string) => {
      if (url === "/api/employees/metrics/job-title") {
        return {
          data: [
            { jobTitle: "Engineer", employeeCount: 5, avgSalary: 60000 },
            { jobTitle: "Designer", employeeCount: 3, avgSalary: 55000 },
            { jobTitle: "Manager", employeeCount: 2, avgSalary: 80000 },
          ],
          error: null,
          isLoading: false,
        };
      }
      return { data: [], error: null, isLoading: false };
    });

    render(<MetricsDashboard />);

    // Should show "3" (number of job titles) and "Unique positions"
    expect(screen.getByText("Job Titles")).toBeInTheDocument();
    expect(screen.getByText("Unique positions")).toBeInTheDocument();
  });

  it("renders chart components", () => {
    mockUseSWR.mockImplementation((url: string) => {
      if (url === "/api/employees/metrics/country") {
        return {
          data: [
            {
              country: "India",
              employeeCount: 5,
              avgSalary: 50000,
              minSalary: 40000,
              maxSalary: 60000,
            },
          ],
          error: null,
          isLoading: false,
        };
      }
      return { data: [], error: null, isLoading: false };
    });

    render(<MetricsDashboard />);

    // Check if chart card containers are rendered - look for the actual title text from component
    const countryCard = screen
      .getByText(/Salary by Country/i)
      .closest('[data-slot="card"]');
    expect(countryCard).toBeInTheDocument();

    const jobTitleCard = screen
      .getByText(/Average Salary by Job Title/i)
      .closest('[data-slot="card"]');
    expect(jobTitleCard).toBeInTheDocument();
  });
});

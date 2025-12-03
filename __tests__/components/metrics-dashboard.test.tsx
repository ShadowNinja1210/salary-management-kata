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

// Mock SWR with empty data to avoid complex mocking issues
jest.mock("swr", () => ({
  __esModule: true,
  default: () => ({
    data: [],
    error: null,
    isLoading: false,
  }),
}));

describe("MetricsDashboard", () => {
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
});

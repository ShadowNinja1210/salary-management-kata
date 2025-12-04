"use client";

import { useState } from "react";
import useSWR from "swr";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Plus, Users, Search, Filter, X } from "lucide-react";
import { EmployeeTable } from "./employee-table";
import { EmployeeForm } from "./employee-form";
import type { Employee, CreateEmployeeInput } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface EmployeesResponse {
  data: (Employee & { netSalary: number })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function EmployeeManager() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Input states for immediate UI updates
  const [searchInput, setSearchInput] = useState("");
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [minSalaryInput, setMinSalaryInput] = useState("");
  const [maxSalaryInput, setMaxSalaryInput] = useState("");

  // Debounced values for API calls (500ms delay)
  const debouncedSearch = useDebounce(searchInput, 500);
  const debouncedJobTitle = useDebounce(jobTitleInput, 500);
  const debouncedMinSalary = useDebounce(minSalaryInput, 500);
  const debouncedMaxSalary = useDebounce(maxSalaryInput, 500);

  const [country, setCountry] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Build query string with debounced values
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (country) params.set("country", country);
    if (debouncedJobTitle) params.set("jobTitle", debouncedJobTitle);
    if (debouncedMinSalary) params.set("minSalary", debouncedMinSalary);
    if (debouncedMaxSalary) params.set("maxSalary", debouncedMaxSalary);
    return params.toString();
  };
  const {
    data: response,
    error,
    mutate,
  } = useSWR<EmployeesResponse>(
    `/api/employees?${buildQueryString()}`,
    fetcher
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const employees = response?.data || [];
  const pagination = response?.pagination;

  const handleCreate = async (data: CreateEmployeeInput) => {
    const response = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    mutate();
  };

  const handleUpdate = async (data: CreateEmployeeInput) => {
    if (!editingEmployee) return;
    const response = await fetch(`/api/employees/${editingEmployee.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    mutate();
    setEditingEmployee(null);
  };

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/employees/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    mutate();
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingEmployee(null);
    }
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setCountry("");
    setJobTitleInput("");
    setMinSalaryInput("");
    setMaxSalaryInput("");
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch ||
    country ||
    debouncedJobTitle ||
    debouncedMinSalary ||
    debouncedMaxSalary;

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    if (!pagination) return [];
    const { totalPages } = pagination;
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current page
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        Failed to load employees. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Employees</h2>
            <p className="text-sm text-muted-foreground">
              {pagination
                ? `${pagination.total} total employees`
                : "Loading..."}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, job title, or country..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="default"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="default" onClick={handleClearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Country</label>
              <Select
                value={country}
                onValueChange={(value) => {
                  setCountry(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="UK">UK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Job Title</label>
              <Input
                placeholder="e.g. Engineer"
                value={jobTitleInput}
                onChange={(e) => setJobTitleInput(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Min Salary</label>
              <Input
                type="number"
                placeholder="e.g. 50000"
                value={minSalaryInput}
                onChange={(e) => setMinSalaryInput(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Max Salary</label>
              <Input
                type="number"
                placeholder="e.g. 100000"
                value={maxSalaryInput}
                onChange={(e) => setMaxSalaryInput(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Info */}
      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {employees.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
            {Math.min(page * limit, pagination.total)} of {pagination.total}{" "}
            results
          </div>
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Table */}
      <EmployeeTable
        employees={employees}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(Math.max(1, page - 1))}
                aria-disabled={page === 1}
                className={
                  page === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {generatePageNumbers().map((pageNum, idx) => (
              <PaginationItem key={idx}>
                {pageNum === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => setPage(pageNum)}
                    isActive={page === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPage(Math.min(pagination.totalPages, page + 1))
                }
                aria-disabled={page === pagination.totalPages}
                className={
                  page === pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Form Dialog */}
      <EmployeeForm
        open={formOpen}
        onOpenChange={handleFormClose}
        employee={editingEmployee}
        onSubmit={editingEmployee ? handleUpdate : handleCreate}
      />
    </div>
  );
}

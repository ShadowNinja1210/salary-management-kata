"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Employee } from "@/lib/types";

interface EmployeeTableProps {
  employees: (Employee & { netSalary: number })[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => Promise<void>;
}

export function EmployeeTable({
  employees,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await onDelete(deleteId);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTdsRate = (country: string) => {
    if (country === "India") return "10%";
    if (country === "USA") return "12%";
    return "0%";
  };

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="text-muted-foreground">Full Name</TableHead>
              <TableHead className="text-muted-foreground">Job Title</TableHead>
              <TableHead className="text-muted-foreground">Country</TableHead>
              <TableHead className="text-muted-foreground text-right">
                Gross Salary
              </TableHead>
              <TableHead className="text-muted-foreground text-right">
                TDS Rate
              </TableHead>
              <TableHead className="text-muted-foreground text-right">
                Net Salary
              </TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No employees found. Add your first employee to get started.
                </TableCell>
              </TableRow>
            ) : (
              employees?.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-secondary/30">
                  <TableCell className="font-medium">
                    {employee.fullName}
                  </TableCell>
                  <TableCell>{employee.jobTitle}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-foreground">
                      {employee.country}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(employee.salary))}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-muted-foreground">
                      {getTdsRate(employee.country)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    {formatCurrency(employee.netSalary)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-card border-border"
                      >
                        <DropdownMenuItem
                          onClick={() => onEdit(employee)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(employee.id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this employee? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

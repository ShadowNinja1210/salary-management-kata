"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { EmployeeTable } from "./employee-table"
import { EmployeeForm } from "./employee-form"
import type { Employee, CreateEmployeeInput } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function EmployeeManager() {
  const { data: employees, error, mutate } = useSWR<(Employee & { netSalary: number })[]>("/api/employees", fetcher)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const handleCreate = async (data: CreateEmployeeInput) => {
    const response = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }
    mutate()
  }

  const handleUpdate = async (data: CreateEmployeeInput) => {
    if (!editingEmployee) return
    const response = await fetch(`/api/employees/${editingEmployee.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }
    mutate()
    setEditingEmployee(null)
  }

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/employees/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }
    mutate()
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) {
      setEditingEmployee(null)
    }
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        Failed to load employees. Please try again.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Employees</h2>
            <p className="text-sm text-muted-foreground">
              {employees ? `${employees.length} total employees` : "Loading..."}
            </p>
          </div>
        </div>
        <Button onClick={() => setFormOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <EmployeeTable employees={employees || []} onEdit={handleEdit} onDelete={handleDelete} />

      <EmployeeForm
        open={formOpen}
        onOpenChange={handleFormClose}
        employee={editingEmployee}
        onSubmit={editingEmployee ? handleUpdate : handleCreate}
      />
    </div>
  )
}

export type Employee = {
  id: number
  fullName: string
  jobTitle: string
  country: string
  salary: string | number
  createdAt: Date
}

export type CreateEmployeeInput = {
  fullName: string
  jobTitle: string
  country: string
  salary: number
}

export type EmployeeInput = {
  fullName: string
  jobTitle: string
  country: string
  salary: string
}

export type SalaryCalculation = {
  gross: string
  tds: string
  net: string
}

export type CountryMetrics = {
  min: string | null
  max: string | null
  avg: string | null
}

export type JobTitleMetrics = {
  avg: string | null
}

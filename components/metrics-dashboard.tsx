"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Briefcase, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface CountryMetric {
  country: string
  minSalary: number
  maxSalary: number
  avgSalary: number
  employeeCount: number
}

interface JobTitleMetric {
  jobTitle: string
  avgSalary: number
  employeeCount: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function MetricsDashboard() {
  const { data: countryMetrics } = useSWR<CountryMetric[]>("/api/employees/metrics/country", fetcher)
  const { data: jobTitleMetrics } = useSWR<JobTitleMetric[]>("/api/employees/metrics/job-title", fetcher)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalEmployees = countryMetrics?.reduce((sum, m) => sum + m.employeeCount, 0) || 0
  const overallAvg =
    countryMetrics && countryMetrics.length > 0
      ? countryMetrics.reduce((sum, m) => sum + m.avgSalary * m.employeeCount, 0) / totalEmployees
      : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Salary Metrics</h2>
          <p className="text-sm text-muted-foreground">Overview of salary distribution</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Across {countryMetrics?.length || 0} countries</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Gross Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(overallAvg)}</div>
            <p className="text-xs text-muted-foreground">Before TDS deductions</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Job Titles</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobTitleMetrics?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Unique positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Country Breakdown */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Salary by Country
          </CardTitle>
          <CardDescription>Min, max, and average salary breakdown by country</CardDescription>
        </CardHeader>
        <CardContent>
          {!countryMetrics || countryMetrics.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No data available. Add employees to see metrics.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {countryMetrics.map((metric) => (
                <div key={metric.country} className="flex flex-col gap-2 p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{metric.country}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {metric.employeeCount} employee{metric.employeeCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <span className="text-primary font-semibold">Avg: {formatCurrency(metric.avgSalary)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingDown className="h-3 w-3" />
                      Min: {formatCurrency(metric.minSalary)}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      Max: {formatCurrency(metric.maxSalary)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Title Breakdown */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Average Salary by Job Title
          </CardTitle>
          <CardDescription>Sorted by highest average salary</CardDescription>
        </CardHeader>
        <CardContent>
          {!jobTitleMetrics || jobTitleMetrics.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No data available. Add employees to see metrics.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {jobTitleMetrics.map((metric, index) => (
                <div key={metric.jobTitle} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{metric.jobTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {metric.employeeCount} employee{metric.employeeCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-primary font-semibold">{formatCurrency(metric.avgSalary)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

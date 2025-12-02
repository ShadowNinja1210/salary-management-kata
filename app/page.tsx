import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeManager } from "@/components/employee-manager"
import { MetricsDashboard } from "@/components/metrics-dashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Salary Management</h1>
          <p className="text-sm text-muted-foreground">Manage employees and track salary metrics</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="mb-6 bg-secondary">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>
          <TabsContent value="employees">
            <EmployeeManager />
          </TabsContent>
          <TabsContent value="metrics">
            <MetricsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

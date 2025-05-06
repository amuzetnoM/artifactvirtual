import { DashboardLayout } from "@/components/dashboard-layout"
import { ServerManagementDashboard } from "@/components/server-management-dashboard"

export default function ServersPage() {
  return (
    <DashboardLayout>
      <ServerManagementDashboard />
    </DashboardLayout>
  )
}

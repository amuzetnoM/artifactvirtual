import { DashboardLayout } from "@/components/dashboard-layout"
import { SystemManagementDashboard } from "@/components/system-management-dashboard"

export default function SystemPage() {
  return (
    <DashboardLayout>
      <SystemManagementDashboard />
    </DashboardLayout>
  )
}

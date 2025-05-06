import { DashboardLayout } from "@/components/dashboard-layout"
import { BlockchainWalletsDashboard } from "@/components/blockchain-wallets-dashboard"

export default function BlockchainWalletsPage() {
  return (
    <DashboardLayout>
      <BlockchainWalletsDashboard />
    </DashboardLayout>
  )
}

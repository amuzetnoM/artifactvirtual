import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BlockchainDashboard } from "@/components/blockchain-dashboard"

export default function BlockchainPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <BlockchainDashboard />
      </main>
      <Footer />
    </div>
  )
}

"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BlockchainDeployer } from "@/components/blockchain-deployer"
import { TransactionHistory } from "@/components/transaction-history"
import { NetworkStats } from "@/components/network-stats"
import { ContractInteraction } from "@/components/contract-interaction"
import { Button } from "@/components/ui/button"
import { Wallet, BarChart3, FileCode, History, RefreshCw } from "lucide-react"

export function BlockchainDashboard() {
  const [network, setNetwork] = useState("ethereum")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Blockchain Dashboard</h1>
          <p className="text-muted-foreground">Deploy, verify, and interact with smart contracts</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={network} onValueChange={setNetwork}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
              <SelectItem value="goerli">Goerli Testnet</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="bsc">Binance Smart Chain</SelectItem>
              <SelectItem value="arbitrum">Arbitrum</SelectItem>
              <SelectItem value="optimism">Optimism</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <NetworkStats network={network} />
      </div>

      <Tabs defaultValue="deploy" className="space-y-6">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="deploy" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            <span className="hidden sm:inline">Deploy & Verify</span>
            <span className="sm:hidden">Deploy</span>
          </TabsTrigger>
          <TabsTrigger value="interact" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Contract Interaction</span>
            <span className="sm:hidden">Interact</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Transaction History</span>
            <span className="sm:hidden">Txns</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deploy">
          <BlockchainDeployer />
        </TabsContent>

        <TabsContent value="interact">
          <ContractInteraction network={network} />
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent transactions on {network}</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionHistory network={network} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Network Analytics</CardTitle>
              <CardDescription>Performance metrics and statistics for {network}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/30 rounded-md">
                <p className="text-muted-foreground">Analytics dashboard coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

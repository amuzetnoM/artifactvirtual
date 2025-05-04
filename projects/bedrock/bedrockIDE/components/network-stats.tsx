"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, Cpu, DollarSign, Zap } from "lucide-react"
import { getNetworkStats } from "@/lib/blockchain-utils"

interface NetworkStatsProps {
  network: string
}

export function NetworkStats({ network }: NetworkStatsProps) {
  const [stats, setStats] = useState<{
    gasPrice: string
    latestBlock: string
    tps: string
    nativeTokenPrice: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const data = await getNetworkStats(network)
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch network stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [network])

  const items = [
    {
      title: "Gas Price",
      value: stats?.gasPrice || "-",
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      title: "Latest Block",
      value: stats?.latestBlock || "-",
      icon: Cpu,
      color: "text-blue-500",
    },
    {
      title: "TPS",
      value: stats?.tps || "-",
      icon: Activity,
      color: "text-green-500",
    },
    {
      title: `${network === "ethereum" ? "ETH" : network === "polygon" ? "MATIC" : "Token"} Price`,
      value: stats?.nativeTokenPrice || "-",
      icon: DollarSign,
      color: "text-purple-500",
    },
  ]

  return (
    <>
      {items.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-7 w-20" /> : <div className="text-2xl font-bold">{item.value}</div>}
          </CardContent>
        </Card>
      ))}
    </>
  )
}

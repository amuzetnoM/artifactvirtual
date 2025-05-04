"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getTransactionHistory } from "@/lib/blockchain-utils"
import { ExternalLink } from "lucide-react"

interface TransactionHistoryProps {
  network: string
  address?: string
}

export function TransactionHistory({ network, address }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        const data = await getTransactionHistory(network, address)
        setTransactions(data)
      } catch (error) {
        console.error("Failed to fetch transaction history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [network, address])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No transactions found</div>
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <Badge variant={tx.status === "confirmed" ? "default" : "outline"}>{tx.status}</Badge>
              <span className="text-xs text-muted-foreground">{tx.timestamp}</span>
            </div>
            <a
              href={`https://${network === "ethereum" ? "" : network + "."}etherscan.io/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline flex items-center gap-1"
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">From: </span>
              <span className="font-mono">
                {tx.from.substring(0, 8)}...{tx.from.substring(tx.from.length - 6)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">To: </span>
              <span className="font-mono">
                {tx.to.substring(0, 8)}...{tx.to.substring(tx.to.length - 6)}
              </span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-muted-foreground text-sm">Value: </span>
            <span className="font-medium">{tx.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

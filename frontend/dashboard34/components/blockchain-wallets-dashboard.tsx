"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, Eye, EyeOff, Plus, RefreshCw, Send, Wallet } from "lucide-react"

export function BlockchainWalletsDashboard() {
  const [showPrivateKey, setShowPrivateKey] = React.useState(false)

  const wallets = [
    {
      name: "Main Ethereum Wallet",
      address: "0x1234...5678",
      balance: "1.45 ETH",
      network: "Ethereum",
      chainId: 1,
      privateKey: "0xabcd...efgh",
    },
    {
      name: "Celo Development",
      address: "0x8765...4321",
      balance: "250 CELO",
      network: "Celo",
      chainId: 42220,
      privateKey: "0xijkl...mnop",
    },
    {
      name: "Optimism Testing",
      address: "0x9876...5432",
      balance: "0.75 OP",
      network: "Optimism",
      chainId: 10,
      privateKey: "0xqrst...uvwx",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-text"></h2>
          <p className="text-muted-foreground"></p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Wallet
        </Button>
      </div>

      <Tabs defaultValue="wallets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wallets">My Wallets</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wallets.map((wallet) => (
              <Card key={wallet.address} className="overflow-hidden card-hover border-glow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{wallet.name}</CardTitle>
                    </div>
                    <Badge>{wallet.network}</Badge>
                  </div>
                  <CardDescription>Chain ID: {wallet.chainId}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Address</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="h-3 w-3" />
                          <span className="sr-only">Copy address</span>
                        </Button>
                      </div>
                      <div className="rounded-md bg-muted p-2 text-sm font-mono">{wallet.address}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Private Key</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                        >
                          {showPrivateKey ? (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" /> Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" /> Show
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="rounded-md bg-muted p-2 text-sm font-mono">
                        {showPrivateKey ? wallet.privateKey : "••••••••••••••••••••"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Balance</span>
                      <span className="font-bold">{wallet.balance}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 gap-1">
                        <Send className="h-4 w-4" /> Send
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1">
                        <RefreshCw className="h-4 w-4" /> Refresh
                      </Button>
                      <Button size="sm" variant="outline" className="w-9 p-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-accent/50 border-glow">
              <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="font-medium">Add New Wallet</p>
              <p className="text-sm text-muted-foreground">Connect or create a blockchain wallet</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="border-glow">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>View and manage your blockchain transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-4">
                  <h3 className="text-lg font-medium">Transaction History</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Sent 0.5 ETH</p>
                          <p className="text-sm text-muted-foreground">To: 0x9876...5432</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">-0.5 ETH</p>
                        <p className="text-sm text-muted-foreground">2024-05-03</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-primary rotate-180" />
                        <div>
                          <p className="font-medium">Received 100 CELO</p>
                          <p className="text-sm text-muted-foreground">From: 0x1234...5678</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-500">+100 CELO</p>
                        <p className="text-sm text-muted-foreground">2024-05-01</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Sent 0.25 OP</p>
                          <p className="text-sm text-muted-foreground">To: 0x5432...1098</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">-0.25 OP</p>
                        <p className="text-sm text-muted-foreground">2024-04-28</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nfts" className="space-y-4">
          <Card className="border-glow">
            <CardHeader>
              <CardTitle>NFT Collection</CardTitle>
              <CardDescription>View and manage your NFTs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="overflow-hidden card-hover border-glow">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <div className="text-4xl">🖼️</div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium">Artifact #042</h3>
                    <p className="text-sm text-muted-foreground">Collection: Artifacts</p>
                    <div className="mt-2 flex justify-between">
                      <Badge variant="outline">Ethereum</Badge>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden card-hover border-glow">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <div className="text-4xl">🌌</div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium">Space Explorer #007</h3>
                    <p className="text-sm text-muted-foreground">Collection: Space Explorers</p>
                    <div className="mt-2 flex justify-between">
                      <Badge variant="outline">Celo</Badge>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-accent/50 border-glow">
                  <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
                  <p className="font-medium">Mint New NFT</p>
                  <p className="text-sm text-muted-foreground">Create or import an NFT</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

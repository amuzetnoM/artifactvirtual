"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code, FileCode, Play, Plus, Settings, Terminal } from "lucide-react"

export function BlockchainDashboard() {
  const contracts = [
    {
      name: "TokenContract",
      description: "ERC-20 token implementation",
      network: "localhost",
      status: "compiled",
      lastDeployed: "Never",
      language: "Solidity",
    },
    {
      name: "NFTMarketplace",
      description: "NFT marketplace with auction support",
      network: "localhost",
      status: "compiled",
      lastDeployed: "2024-04-28 15:30:22",
      language: "Solidity",
    },
    {
      name: "MultiSigWallet",
      description: "Multi-signature wallet implementation",
      network: "sepolia",
      status: "deployed",
      lastDeployed: "2024-05-01 09:15:42",
      language: "Solidity",
    },
  ]

  const networks = [
    {
      name: "localhost",
      chainId: 31337,
      status: "running",
      type: "development",
    },
    {
      name: "sepolia",
      chainId: 11155111,
      status: "connected",
      type: "testnet",
    },
    {
      name: "mainnet",
      chainId: 1,
      status: "disconnected",
      type: "mainnet",
    },
  ]

  const tasks = [
    {
      name: "compile",
      description: "Compile all contracts",
      lastRun: "2024-05-03 14:22:15",
      status: "success",
    },
    {
      name: "test",
      description: "Run contract test suite",
      lastRun: "2024-05-03 14:25:30",
      status: "success",
    },
    {
      name: "deploy:local",
      description: "Deploy to local network",
      lastRun: "2024-05-03 14:30:12",
      status: "success",
    },
    {
      name: "deploy:sepolia",
      description: "Deploy to Sepolia testnet",
      lastRun: "2024-05-01 09:15:42",
      status: "success",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight"></h2>
        <Button className="gap-2">
          <Settings className="h-4 w-4" /> Configure Hardhat
        </Button>
      </div>

      <Tabs defaultValue="contracts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
          <TabsTrigger value="networks">Networks</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contracts.map((contract) => (
              <Card key={contract.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{contract.name}</CardTitle>
                    </div>
                    <Badge
                      className={
                        contract.status === "deployed"
                          ? "bg-green-500"
                          : contract.status === "compiled"
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                      }
                    >
                      {contract.status}
                    </Badge>
                  </div>
                  <CardDescription>{contract.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Network</p>
                      <p className="font-medium">{contract.network}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Language</p>
                      <p className="font-medium">{contract.language}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Last Deployed</p>
                      <p className="font-medium">{contract.lastDeployed}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 gap-1">
                      <Code className="h-4 w-4" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1">
                      <Play className="h-4 w-4" /> Deploy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-accent/50">
              <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="font-medium">Create New Contract</p>
              <p className="text-sm text-muted-foreground">Add a new smart contract</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="networks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Configuration</CardTitle>
              <CardDescription>Manage blockchain networks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Chain ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {networks.map((network) => (
                        <tr key={network.name} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">{network.name}</td>
                          <td className="p-4 align-middle">{network.chainId}</td>
                          <td className="p-4 align-middle">{network.type}</td>
                          <td className="p-4 align-middle">
                            <Badge
                              className={
                                network.status === "running"
                                  ? "bg-green-500"
                                  : network.status === "connected"
                                    ? "bg-blue-500"
                                    : "bg-gray-500"
                              }
                            >
                              {network.status}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex gap-2">
                              {network.status === "running" ? (
                                <Button size="sm" variant="outline">
                                  Stop
                                </Button>
                              ) : network.status === "connected" ? (
                                <Button size="sm" variant="outline">
                                  Disconnect
                                </Button>
                              ) : (
                                <Button size="sm">Connect</Button>
                              )}
                              <Button size="sm" variant="outline">
                                Configure
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add Network</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Network Name</label>
                        <input
                          className="rounded-md border border-input bg-background px-3 py-2"
                          placeholder="e.g., arbitrum"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Chain ID</label>
                        <input
                          className="rounded-md border border-input bg-background px-3 py-2"
                          placeholder="e.g., 42161"
                          type="number"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Network Type</label>
                        <select className="rounded-md border border-input bg-background px-3 py-2">
                          <option>mainnet</option>
                          <option>testnet</option>
                          <option>development</option>
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">RPC URL</label>
                        <input
                          className="rounded-md border border-input bg-background px-3 py-2"
                          placeholder="e.g., https://arb1.arbitrum.io/rpc"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Block Explorer</label>
                        <input
                          className="rounded-md border border-input bg-background px-3 py-2"
                          placeholder="e.g., https://arbiscan.io"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button className="w-full">Add Network</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hardhat Tasks</CardTitle>
              <CardDescription>Run and manage blockchain development tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">Task</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Last Run</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.name} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle font-mono">{task.name}</td>
                          <td className="p-4 align-middle">{task.description}</td>
                          <td className="p-4 align-middle">{task.lastRun}</td>
                          <td className="p-4 align-middle">
                            <Badge
                              className={
                                task.status === "success"
                                  ? "bg-green-500"
                                  : task.status === "running"
                                    ? "bg-blue-500"
                                    : "bg-red-500"
                              }
                            >
                              {task.status}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <Button size="sm" className="gap-1">
                              <Play className="h-4 w-4" /> Run
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Hardhat Console</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black rounded-md p-4 font-mono text-white text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Terminal className="h-4 w-4" />
                        <span>Hardhat Network</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-green-400">$ npx hardhat compile</p>
                        <p className="text-gray-400">Compiling 3 Solidity files</p>
                        <p className="text-gray-400">Compilation finished successfully</p>
                        <p className="text-green-400">$ npx hardhat test</p>
                        <p className="text-gray-400">TokenContract</p>
                        <p className="text-gray-400">✓ Should deploy the contract (1234ms)</p>
                        <p className="text-gray-400">✓ Should mint tokens to owner (876ms)</p>
                        <p className="text-gray-400">✓ Should transfer tokens between accounts (1543ms)</p>
                        <p className="text-gray-400">3 passing (3.65s)</p>
                        <p className="flex items-center gap-1 text-white">
                          <span className="text-green-400">$</span> _
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button className="gap-1">
                        <Terminal className="h-4 w-4" /> Open Terminal
                      </Button>
                      <Button variant="outline">Clear Console</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

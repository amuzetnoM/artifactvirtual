import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileCode, Plus, Cpu, History, Check, AlertCircle, HelpCircle } from "lucide-react"

export default function BlockchainContractsPage() {
  // Sample smart contracts data
  const contracts = [
    {
      id: "1",
      name: "TokenSwap",
      description: "Automated token exchange contract with liquidity pools",
      language: "Solidity",
      version: "0.8.17",
      status: "Deployed",
      network: "Ethereum",
      address: "0x1a2b3c4d5e6f...",
      lastDeployed: "2024-05-01",
      audited: true
    },
    {
      id: "2",
      name: "MultiSigWallet",
      description: "Multi-signature wallet requiring multiple approvals",
      language: "Solidity",
      version: "0.8.15",
      status: "Deployed",
      network: "Polygon",
      address: "0x7g8h9i0j1k2l...",
      lastDeployed: "2024-04-28",
      audited: true
    },
    {
      id: "3",
      name: "NFTMarketplace",
      description: "Marketplace for trading non-fungible tokens",
      language: "Solidity",
      version: "0.8.16",
      status: "Testing",
      network: "Development",
      address: "-",
      lastDeployed: "-",
      audited: false
    },
    {
      id: "4",
      name: "GovernanceDAO",
      description: "Decentralized autonomous organization governance",
      language: "Solidity",
      version: "0.8.17",
      status: "Draft",
      network: "-",
      address: "-",
      lastDeployed: "-",
      audited: false
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight gradient-text">Smart Contracts</h2>
            <p className="text-muted-foreground">Manage and deploy blockchain smart contracts</p>
          </div>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search contracts..." className="w-full pl-8" />
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Contract
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Contracts</TabsTrigger>
            <TabsTrigger value="deployed">Deployed</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contracts.map((contract) => (
                <Card key={contract.id} className="overflow-hidden card-hover border-glow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{contract.name}</CardTitle>
                      <Badge
                        className={
                          contract.status === "Deployed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : contract.status === "Testing"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }
                      >
                        {contract.status}
                      </Badge>
                    </div>
                    <CardDescription>{contract.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <FileCode className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Language:</span>
                        </div>
                        <div>{contract.language} v{contract.version}</div>
                        
                        <div className="flex items-center gap-1">
                          <Cpu className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Network:</span>
                        </div>
                        <div>{contract.network}</div>
                        
                        <div className="flex items-center gap-1">
                          <History className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Last Deployed:</span>
                        </div>
                        <div>{contract.lastDeployed}</div>
                        
                        <div className="flex items-center gap-1">
                          {contract.audited ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-amber-500" />
                          )}
                          <span className="text-muted-foreground">Audited:</span>
                        </div>
                        <div>{contract.audited ? "Yes" : "No"}</div>
                      </div>
                      
                      {contract.status === "Deployed" && (
                        <div className="border rounded-md p-2 bg-muted/20 font-mono text-xs overflow-hidden text-ellipsis">
                          {contract.address}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t bg-muted/10 px-6 py-3">
                    <Button size="sm" className="flex-1">View</Button>
                    {contract.status !== "Deployed" ? (
                      <Button size="sm" variant="outline" className="flex-1">Deploy</Button>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1">Interact</Button>
                    )}
                    <Button size="sm" variant="ghost" className="w-9 p-0">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              <Card className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-accent/50 border-glow">
                <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="font-medium">Create New Contract</p>
                <p className="text-sm text-muted-foreground">Start from scratch or use a template</p>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="deployed" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contracts.filter(c => c.status === "Deployed").map((contract) => (
                <Card key={contract.id} className="overflow-hidden card-hover border-glow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{contract.name}</CardTitle>
                      <Badge
                        className={
                          contract.status === "Deployed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : contract.status === "Testing"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }
                      >
                        {contract.status}
                      </Badge>
                    </div>
                    <CardDescription>{contract.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <FileCode className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Language:</span>
                        </div>
                        <div>{contract.language} v{contract.version}</div>
                        
                        <div className="flex items-center gap-1">
                          <Cpu className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Network:</span>
                        </div>
                        <div>{contract.network}</div>
                        
                        <div className="flex items-center gap-1">
                          <History className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Last Deployed:</span>
                        </div>
                        <div>{contract.lastDeployed}</div>
                        
                        <div className="flex items-center gap-1">
                          {contract.audited ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-amber-500" />
                          )}
                          <span className="text-muted-foreground">Audited:</span>
                        </div>
                        <div>{contract.audited ? "Yes" : "No"}</div>
                      </div>
                      
                      {contract.status === "Deployed" && (
                        <div className="border rounded-md p-2 bg-muted/20 font-mono text-xs overflow-hidden text-ellipsis">
                          {contract.address}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t bg-muted/10 px-6 py-3">
                    <Button size="sm" className="flex-1">View</Button>
                    {contract.status !== "Deployed" ? (
                      <Button size="sm" variant="outline" className="flex-1">Deploy</Button>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1">Interact</Button>
                    )}
                    <Button size="sm" variant="ghost" className="w-9 p-0">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="testing" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contracts.filter(c => c.status === "Testing").map((contract) => (
                <Card key={contract.id} className="overflow-hidden card-hover border-glow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{contract.name}</CardTitle>
                      <Badge
                        className={
                          contract.status === "Deployed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : contract.status === "Testing"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }
                      >
                        {contract.status}
                      </Badge>
                    </div>
                    <CardDescription>{contract.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <FileCode className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Language:</span>
                        </div>
                        <div>{contract.language} v{contract.version}</div>
                        
                        <div className="flex items-center gap-1">
                          <Cpu className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Network:</span>
                        </div>
                        <div>{contract.network}</div>
                        
                        <div className="flex items-center gap-1">
                          <History className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Last Deployed:</span>
                        </div>
                        <div>{contract.lastDeployed}</div>
                        
                        <div className="flex items-center gap-1">
                          {contract.audited ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-amber-500" />
                          )}
                          <span className="text-muted-foreground">Audited:</span>
                        </div>
                        <div>{contract.audited ? "Yes" : "No"}</div>
                      </div>
                      
                      {contract.status === "Deployed" && (
                        <div className="border rounded-md p-2 bg-muted/20 font-mono text-xs overflow-hidden text-ellipsis">
                          {contract.address}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t bg-muted/10 px-6 py-3">
                    <Button size="sm" className="flex-1">View</Button>
                    {contract.status !== "Deployed" ? (
                      <Button size="sm" variant="outline" className="flex-1">Deploy</Button>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1">Interact</Button>
                    )}
                    <Button size="sm" variant="ghost" className="w-9 p-0">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="draft" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contracts.filter(c => c.status === "Draft").map((contract) => (
                <Card key={contract.id} className="overflow-hidden card-hover border-glow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{contract.name}</CardTitle>
                      <Badge
                        className={
                          contract.status === "Deployed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : contract.status === "Testing"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }
                      >
                        {contract.status}
                      </Badge>
                    </div>
                    <CardDescription>{contract.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <FileCode className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Language:</span>
                        </div>
                        <div>{contract.language} v{contract.version}</div>
                        
                        <div className="flex items-center gap-1">
                          <Cpu className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Network:</span>
                        </div>
                        <div>{contract.network}</div>
                        
                        <div className="flex items-center gap-1">
                          <History className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Last Deployed:</span>
                        </div>
                        <div>{contract.lastDeployed}</div>
                        
                        <div className="flex items-center gap-1">
                          {contract.audited ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-amber-500" />
                          )}
                          <span className="text-muted-foreground">Audited:</span>
                        </div>
                        <div>{contract.audited ? "Yes" : "No"}</div>
                      </div>
                      
                      {contract.status === "Deployed" && (
                        <div className="border rounded-md p-2 bg-muted/20 font-mono text-xs overflow-hidden text-ellipsis">
                          {contract.address}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t bg-muted/10 px-6 py-3">
                    <Button size="sm" className="flex-1">View</Button>
                    {contract.status !== "Deployed" ? (
                      <Button size="sm" variant="outline" className="flex-1">Deploy</Button>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1">Interact</Button>
                    )}
                    <Button size="sm" variant="ghost" className="w-9 p-0">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
} 
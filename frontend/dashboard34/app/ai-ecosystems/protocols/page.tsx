import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitPullRequest, Network, Search, Globe, Code, Server, HelpCircle, ArrowRight, Check, Users, GitBranch } from "lucide-react"

export default function AICommunicationProtocolsPage() {
  // Sample protocols data
  const protocols = [
    {
      id: "1",
      name: "Agent Communication Standard",
      description: "Standard protocol for communication between AI agents",
      type: "Inter-Agent",
      version: "2.4.1",
      status: "Active",
      users: 1245,
      implementations: 8,
      lastUpdated: "2024-05-02",
      maintainer: "Agent Standards Working Group"
    },
    {
      id: "2",
      name: "Model Inference Protocol",
      description: "Standard for AI model inference requests and responses",
      type: "Model-Client",
      version: "3.1.0",
      status: "Active",
      users: 3487,
      implementations: 12,
      lastUpdated: "2024-04-29",
      maintainer: "Model Interoperability Consortium"
    },
    {
      id: "3",
      name: "Federated Learning Sync",
      description: "Protocol for federated learning synchronization",
      type: "Training",
      version: "1.2.5",
      status: "Active",
      users: 756,
      implementations: 4,
      lastUpdated: "2024-05-03",
      maintainer: "Federated ML Alliance"
    },
    {
      id: "4",
      name: "AI Ethics Verification",
      description: "Protocol for verifying AI model compliance with ethical guidelines",
      type: "Governance",
      version: "0.9.2",
      status: "Beta",
      users: 312,
      implementations: 3,
      lastUpdated: "2024-05-01",
      maintainer: "AI Ethics Committee"
    },
    {
      id: "5",
      name: "Quantum-Classical Interface",
      description: "Protocol for quantum and classical AI system integration",
      type: "Hybrid",
      version: "0.3.7",
      status: "Experimental",
      users: 87,
      implementations: 2,
      lastUpdated: "2024-05-06",
      maintainer: "Quantum Computing Research Group"
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight gradient-text">Communication Protocols</h2>
            <p className="text-muted-foreground">Standards for AI system interoperability and communication</p>
          </div>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search protocols..." className="w-full pl-8" />
            </div>
            <Button className="gap-2">
              <GitPullRequest className="h-4 w-4" /> Create Protocol
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Protocols</TabsTrigger>
            <TabsTrigger value="inter-agent">Inter-Agent</TabsTrigger>
            <TabsTrigger value="model-client">Model-Client</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {protocols.map((protocol) => (
                <Card key={protocol.id} className="overflow-hidden card-hover border-glow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          protocol.type === "Inter-Agent"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : protocol.type === "Model-Client"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : protocol.type === "Training"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                                : protocol.type === "Governance"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }
                      >
                        {protocol.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          protocol.status === "Active"
                            ? "border-green-500 text-green-500"
                            : protocol.status === "Beta"
                              ? "border-amber-500 text-amber-500"
                              : "border-blue-500 text-blue-500"
                        }
                      >
                        {protocol.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{protocol.name}</CardTitle>
                    <CardDescription>{protocol.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Code className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Version:</span>
                      </div>
                      <div>{protocol.version}</div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Users:</span>
                      </div>
                      <div>{protocol.users.toLocaleString()}</div>
                      
                      <div className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Implementations:</span>
                      </div>
                      <div>{protocol.implementations}</div>
                      
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Maintainer:</span>
                      </div>
                      <div className="truncate">{protocol.maintainer}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t bg-muted/10 px-6 py-3">
                    <Button size="sm" className="flex-1 gap-1">
                      <Network className="h-4 w-4" /> Implement
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1">
                      <ArrowRight className="h-4 w-4" /> Explore
                    </Button>
                    <Button size="sm" variant="ghost" className="w-9 p-0">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="inter-agent" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {protocols.filter(p => p.type === "Inter-Agent").map((protocol) => (
                <Card key={protocol.id} className="overflow-hidden card-hover border-glow">
                  {/* Same card content as above */}
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="model-client" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {protocols.filter(p => p.type === "Model-Client").map((protocol) => (
                <Card key={protocol.id} className="overflow-hidden card-hover border-glow">
                  {/* Same card content as above */}
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="training" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {protocols.filter(p => p.type === "Training").map((protocol) => (
                <Card key={protocol.id} className="overflow-hidden card-hover border-glow">
                  {/* Same card content as above */}
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="governance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {protocols.filter(p => p.type === "Governance").map((protocol) => (
                <Card key={protocol.id} className="overflow-hidden card-hover border-glow">
                  {/* Same card content as above */}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
} 
"use client"

import { useState } from "react"
import {
  Activity,
  Brain,
  ChevronRight,
  Code,
  Cpu,
  Database,
  LayoutDashboard,
  Maximize,
  Minimize,
  Plus,
  RefreshCw,
  Terminal,
  Blocks,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

// Import all the page components
import { AIEcosystemsDashboard } from "@/components/ai-ecosystems-dashboard"
import { BlockchainDashboard } from "@/components/blockchain-dashboard"
import { KnowledgeDashboard } from "@/components/knowledge-dashboard"
import { ApplicationsDashboard } from "@/components/applications-dashboard"
import { ProjectsDashboard } from "@/components/projects-dashboard"
import { ResearchDashboard } from "@/components/research-dashboard"
import { SystemManagementDashboard } from "@/components/system-management-dashboard"
import { ServerManagementDashboard } from "@/components/server-management-dashboard"
import { AILabDashboard } from "@/components/ai-lab-dashboard"
import { BlockchainWalletsDashboard } from "@/components/blockchain-wallets-dashboard"
import { QuantumComputingDashboard } from "@/components/quantum-computing-dashboard"

export function UnifiedDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  return (
    <div className="container mx-auto pb-20">
      {/* Overview Section */}
      <section id="overview" className="section pt-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">WORXPACE OVERSIGHT</h1>
            <p className="mt-2 text-muted-foreground">ARTIFACT VIRTUAL</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* AI & Models Overview */}
              <Card className="card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      AI & Models
                    </CardTitle>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                      Operational
                    </Badge>
                  </div>
                  <CardDescription>Model integration and deployment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Models</span>
                      <span className="text-sm font-medium">4/6</span>
                    </div>
                    <Progress value={66} className="h-1" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto gap-1" asChild>
                    <a href="#ai">
                      View Details <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>

              {/* Knowledge Overview */}
              <Card className="card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      Knowledge
                    </CardTitle>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                      Operational
                    </Badge>
                  </div>
                  <CardDescription>Structured data and information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Datasets</span>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <Progress value={75} className="h-1" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto gap-1" asChild>
                    <a href="#knowledge">
                      View Details <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>

              {/* Blockchain Overview */}
              <Card className="card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code className="h-5 w-5 text-primary" />
                      Blockchain
                    </CardTitle>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                      Operational
                    </Badge>
                  </div>
                  <CardDescription>Smart contracts and networks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Networks</span>
                      <span className="text-sm font-medium">3</span>
                    </div>
                    <Progress value={60} className="h-1" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto gap-1" asChild>
                    <a href="#blockchain">
                      View Details <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>

              {/* Projects Overview */}
              <Card className="card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                      Projects
                    </CardTitle>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                      Active
                    </Badge>
                  </div>
                  <CardDescription>Development projects and tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completion</span>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <Progress value={68} className="h-1" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto gap-1" asChild>
                    <a href="#projects">
                      View Details <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>

              {/* Applications Overview */}
              <Card className="card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-primary" />
                      Applications
                    </CardTitle>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                      Active
                    </Badge>
                  </div>
                  <CardDescription>Tools and utilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Running</span>
                      <span className="text-sm font-medium">3/5</span>
                    </div>
                    <Progress value={60} className="h-1" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto gap-1" asChild>
                    <a href="#applications">
                      View Details <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>

              {/* System Overview */}
              <Card className="card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-primary" />
                      System
                    </CardTitle>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                      Healthy
                    </Badge>
                  </div>
                  <CardDescription>Resources and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CPU Usage</span>
                      <span className="text-sm font-medium">42%</span>
                    </div>
                    <Progress value={42} className="h-1" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto gap-1" asChild>
                    <a href="#system">
                      View Details <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>CPU, Memory, and Network usage over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 rounded-md border bg-muted/30 p-4 flex items-center justify-center">
                    <p className="text-muted-foreground">Performance Chart</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Allocation</CardTitle>
                  <CardDescription>Current resource distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 rounded-md border bg-muted/30 p-4 flex items-center justify-center">
                    <p className="text-muted-foreground">Resource Allocation Chart</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>System events and user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">System Event {i + 1}</p>
                          <span className="text-xs text-muted-foreground">2h ago</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="card-hover">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Project {i + 1}</CardTitle>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                        Active
                      </Badge>
                    </div>
                    <CardDescription>Project description goes here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Progress</span>
                        <span className="text-sm font-medium">{Math.floor(Math.random() * 100)}%</span>
                      </div>
                      <Progress value={Math.floor(Math.random() * 100)} className="h-1" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      View Project
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Resources</CardTitle>
                  <CardDescription>Current resource usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>CPU Usage</span>
                        <span className="font-medium">42%</span>
                      </div>
                      <Progress value={42} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Memory Usage</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Storage Usage</span>
                        <span className="font-medium">54%</span>
                      </div>
                      <Progress value={54} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Network Bandwidth</span>
                        <span className="font-medium">23%</span>
                      </div>
                      <Progress value={23} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Status and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="font-medium text-green-500">All Systems Operational</span>
                      </div>
                      <p className="mt-2 text-sm">No issues detected in the last 24 hours.</p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium">Recent Updates</h4>
                      <ul className="mt-2 space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>System update completed (v2.3.1)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>Security patches applied</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>Database optimization completed</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* AI Section */}
      <section id="ai" className="section pt-16 mt-8 border-t">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">AI & Models</h2>
              <p className="mt-1 text-muted-foreground">Manage AI models and ecosystems</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toggleSection("ai")}>
              {expandedSections["ai"] ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {!expandedSections["ai"] ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Models</CardTitle>
                <CardDescription>Available AI models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Active Models</span>
                  <Badge>4/6</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto gap-1" onClick={() => toggleSection("ai")}>
                  View <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">AI Lab</CardTitle>
                <CardDescription>Experiment with models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Available Models</span>
                  <Badge>5</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto gap-1" asChild>
                  <a href="#ai-lab">
                    View <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>

            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quantum</CardTitle>
                <CardDescription>Quantum computing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Quantum Circuits</span>
                  <Badge>3</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto gap-1" asChild>
                  <a href="#quantum">
                    View <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            <AIEcosystemsDashboard />
          </div>
        )}
      </section>

      {/* AI Lab Section */}
      <section id="ai-lab" className="section pt-16 mt-8 border-t">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">AI Lab</h2>
              <p className="mt-1 text-muted-foreground">Experiment with multimodal models</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toggleSection("ai-lab")}>
              {expandedSections["ai-lab"] ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {expandedSections["ai-lab"] ? (
          <div className="space-y-8">
            <AILabDashboard />
          </div>
        ) : (
          <div className="flex items-center justify-center p-12 text-center border rounded-lg border-dashed">
            <div className="max-w-md">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">AI Lab</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Experiment with multimodal models and create complex AI workflows
              </p>
              <Button className="mt-4" onClick={() => toggleSection("ai-lab")}>
                Open AI Lab
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Quantum Computing Section */}
      <section id="quantum" className="section pt-16 mt-8 border-t">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Quantum Computing</h2>
              <p className="mt-1 text-muted-foreground">Quantum algorithms and simulations</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toggleSection("quantum")}>
              {expandedSections["quantum"] ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {expandedSections["quantum"] ? (
          <div className="space-y-8">
            <QuantumComputingDashboard />
          </div>
        ) : (
          <div className="flex items-center justify-center p-12 text-center border rounded-lg border-dashed">
            <div className="max-w-md">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Cpu className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Quantum Computing</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Explore quantum algorithms, circuits, and simulations
              </p>
              <Button className="mt-4" onClick={() => toggleSection("quantum")}>
                Open Quantum Lab
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Knowledge Section */}
      <section id="knowledge" className="section pt-16 mt-8 border-t">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Knowledge Foundations</h2>
              <p className="mt-1 text-muted-foreground">Manage datasets and knowledge bases</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toggleSection("knowledge")}>
              {expandedSections["knowledge"] ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {expandedSections["knowledge"] ? (
          <div className="space-y-8">
            <KnowledgeDashboard />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Datasets</CardTitle>
                <CardDescription>Structured data collections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Total Datasets</span>
                  <Badge>12</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto gap-1" onClick={() => toggleSection("knowledge")}>
                  View <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Library</CardTitle>
                <CardDescription>Document repository</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Documents</span>
                  <Badge>48</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto gap-1" onClick={() => toggleSection("knowledge")}>
                  View <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </section>

      {/* Blockchain Section */}
      <section id="blockchain" className="section pt-16 mt-8 border-t">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Blockchain Development</h2>
              <p className="mt-1 text-muted-foreground">Smart contracts and blockchain networks</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toggleSection("blockchain")}>
              {expandedSections["blockchain"] ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {expandedSections["blockchain"] ? (
          <div className="space-y-8">
            <BlockchainDashboard />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Smart Contracts</CardTitle>
                <CardDescription>Contract development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Deployed Contracts</span>
                  <Badge>3</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto gap-1" onClick={() => toggleSection("blockchain")}>
                  View <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Networks</CardTitle>
                <CardDescription>Blockchain networks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Active Networks</span>
                  <Badge>3</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto gap-1" onClick={() => toggleSection("blockchain")}>
                  View <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Wallets</CardTitle>
                <CardDescription>Blockchain wallets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Connected Wallets</span>
                  <Badge>2</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto gap-1" asChild>
                  <a href="#blockchain-wallets">
                    View <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </section>

      {/* Blockchain Wallets Section */}
      <section id="blockchain-wallets" className="section pt-16 mt-8 border-t">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Blockchain Wallets</h2>
              <p className="mt-1 text-muted-foreground">Manage blockchain wallets and assets</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toggleSection("blockchain-wallets")}>
              {expandedSections["blockchain-wallets"] ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {expandedSections["blockchain-wallets"] ? (
          <div className="space-y-8">
            <BlockchainWalletsDashboard />
          </div>
        ) : (
          <div className="flex items-center justify-center p-12 text-center border rounded-lg border-dashed">
            <div className="max-w-md">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Code className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Blockchain Wallets</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage your blockchain wallets, assets, and transactions
              </p>
              <Button className="mt-4" onClick={() => toggleSection("blockchain-wallets")}>
                Open Wallet Manager
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Applications Section */}
      <section id="applications" className="section pt-16 mt-8 border-t">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Applications</h2>
              <p className="mt-1 text-muted-foreground">Tools and utilities</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toggleSection("applications")}>
              {expandedSections["applications"] ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {expandedSections["applications"] ? (
          <div className="space-y-8">
            <ApplicationsDashboard />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Available Applications</CardTitle>
                <CardDescription>Ready-to-use tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Total Applications</span>
                  <Badge>4</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto gap-1"
                  onClick={() => toggleSection("applications")}
                >
                  View <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Application Logs</CardTitle>
                <CardDescription>Recent activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Recent Events</span>
                  <Badge>12</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto gap-1"
                  onClick={() => toggleSection("applications")}
                >
                  View <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </section>

      {/* Projects Section */}
      <section id="projects" className="section pt-16 mt-8 border-t">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Projects</h2>
              <p className="mt-1 text-muted-foreground">Development projects and tasks</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toggleSection("projects")}>
              {expandedSections["projects"] ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {expandedSections["projects"] ? (
          <div className="space-y-8">
            <ProjectsDashboard />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Project {i + 1}</CardTitle>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                      Active
                    </Badge>
                  </div>
                  <CardDescription>Project description goes here</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm font-medium">{Math.floor(Math.random() * 100)}%</span>
                    </div>
                    <Progress value={Math.floor(Math.random() * 100)} className="h-1" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => toggleSection("projects")}>
                    View All Projects
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Research Section */}
      <section id="research" className="section pt-16 mt-8 border-t">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Research</h2>
              <p className="mt-1 text-muted-foreground">Explore cutting-edge research</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toggleSection("research")}>
              {expandedSections["research"] ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {expandedSections["research"] ? (
          <div className="space-y-8">
            <ResearchDashboard />
          </div>
        ) : (
          <div className="flex items-center justify-center p-12 text-center border rounded-lg border-dashed">
            <div className="max-w-md">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Research Projects</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Explore cutting-edge research projects and experiments
              </p>
              <Button className="mt-4" onClick={() => toggleSection("research")}>
                View Research
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* System Section */}
      <section id="system" className="section pt-16 mt-8 border-t">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">System Management</h2>
              <p className="mt-1 text-muted-foreground">Monitor and manage system resources</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toggleSection("system")}>
              {expandedSections["system"] ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {expandedSections["system"] ? (
          <div className="space-y-8">
            <SystemManagementDashboard />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>Current resource usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>CPU Usage</span>
                      <span className="font-medium">42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Memory Usage</span>
                      <span className="font-medium">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Storage Usage</span>
                      <span className="font-medium">54%</span>
                    </div>
                    <Progress value={54} className="h-2" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => toggleSection("system")}>
                  View Details
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Status and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="font-medium text-green-500">All Systems Operational</span>
                    </div>
                    <p className="mt-2 text-sm">No issues detected in the last 24 hours.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => toggleSection("system")}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </section>

      {/* Servers Section */}
      <section id="servers" className="section pt-16 mt-8 border-t">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Server Management</h2>
              <p className="mt-1 text-muted-foreground">Configure and manage servers</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toggleSection("servers")}>
              {expandedSections["servers"] ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {expandedSections["servers"] ? (
          <div className="space-y-8">
            <ServerManagementDashboard />
          </div>
        ) : (
          <div className="flex items-center justify-center p-12 text-center border rounded-lg border-dashed">
            <div className="max-w-md">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Cpu className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Server Management</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Configure and manage your data, sensory, and MCP servers
              </p>
              <Button className="mt-4" onClick={() => toggleSection("servers")}>
                Manage Servers
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t pt-8 pb-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Blocks className="h-5 w-5 text-primary" />
            <span className="font-bold">Artifact Virtual</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2023 Artifact Virtual. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

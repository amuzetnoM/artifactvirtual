"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Atom, Brain, FileText, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function ResearchDashboard() {
  const researchProjects = [
    {
      id: "1",
      title: "Quantum Neural Networks",
      description: "Exploring the intersection of quantum computing and neural networks",
      category: "Quantum Computing",
      status: "active",
      lastUpdated: "2024-05-02",
      icon: <Atom className="h-8 w-8 text-primary" />,
    },
    {
      id: "2",
      title: "Multimodal Foundation Models",
      description: "Research on improving multimodal capabilities in foundation models",
      category: "AI",
      status: "active",
      lastUpdated: "2024-05-01",
      icon: <Brain className="h-8 w-8 text-primary" />,
    },
    {
      id: "3",
      title: "Zero-Knowledge Proofs in DeFi",
      description: "Applications of ZK proofs in decentralized finance",
      category: "Blockchain",
      status: "planning",
      lastUpdated: "2024-04-28",
      icon: <FileText className="h-8 w-8 text-primary" />,
    },
    {
      id: "4",
      title: "Autonomous Agent Frameworks",
      description: "Developing frameworks for autonomous AI agents",
      category: "AI",
      status: "completed",
      lastUpdated: "2024-04-15",
      icon: <Brain className="h-8 w-8 text-primary" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-text"></h2>
          <p className="text-muted-foreground"></p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search research..." className="w-full pl-8" />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Research
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Research</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="quantum">Quantum</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {researchProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden card-hover border-glow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-primary/10 p-2">{project.icon}</div>
                      <div>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription>{project.category}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      className={
                        project.status === "active"
                          ? "bg-blue-500"
                          : project.status === "planning"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last updated: {project.lastUpdated}</span>
                    <Button>View Research</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {researchProjects
              .filter((p) => p.category === "AI")
              .map((project) => (
                <Card key={project.id} className="overflow-hidden card-hover border-glow">
                  {/* Same card content as above */}
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="quantum" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {researchProjects
              .filter((p) => p.category === "Quantum Computing")
              .map((project) => (
                <Card key={project.id} className="overflow-hidden card-hover border-glow">
                  {/* Same card content as above */}
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {researchProjects
              .filter((p) => p.category === "Blockchain")
              .map((project) => (
                <Card key={project.id} className="overflow-hidden card-hover border-glow">
                  {/* Same card content as above */}
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

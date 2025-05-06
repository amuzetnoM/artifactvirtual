"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FolderKanban, GitBranch, Plus, Search, Settings } from "lucide-react"

export function ProjectsDashboard() {
  const projects = [
    {
      id: "1",
      name: "AI Model Training Pipeline",
      description: "Automated pipeline for training and deploying AI models",
      status: "active",
      progress: 65,
      lastUpdated: "2024-05-01",
      tags: ["AI", "Pipeline", "Automation"],
    },
    {
      id: "2",
      name: "Knowledge Graph Builder",
      description: "Tool for creating and managing knowledge graphs",
      status: "planning",
      progress: 20,
      lastUpdated: "2024-05-03",
      tags: ["Knowledge", "Graph", "Data"],
    },
    {
      id: "3",
      name: "Blockchain Integration",
      description: "Integration with multiple blockchain networks",
      status: "active",
      progress: 45,
      lastUpdated: "2024-04-28",
      tags: ["Blockchain", "Web3", "Integration"],
    },
    {
      id: "4",
      name: "Quantum Algorithm Simulator",
      description: "Simulator for testing quantum algorithms",
      status: "completed",
      progress: 100,
      lastUpdated: "2024-04-15",
      tags: ["Quantum", "Simulation", "Algorithm"],
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
            <Input type="search" placeholder="Search projects..." className="w-full pl-8" />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden card-hover border-glow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{project.name}</CardTitle>
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
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-[hsl(var(--primary-start))] to-[hsl(var(--primary-end))]"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Last updated: {project.lastUpdated}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 gap-1">
                        <FolderKanban className="h-4 w-4" /> View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1">
                        <GitBranch className="h-4 w-4" /> Tasks
                      </Button>
                      <Button size="sm" variant="outline" className="w-9 p-0">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-accent/50 border-glow">
              <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="font-medium">Create New Project</p>
              <p className="text-sm text-muted-foreground">Add a new development project</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter((p) => p.status === "active")
              .map((project) => (
                <Card key={project.id} className="overflow-hidden card-hover border-glow">
                  {/* Same card content as above */}
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter((p) => p.status === "planning")
              .map((project) => (
                <Card key={project.id} className="overflow-hidden card-hover border-glow">
                  {/* Same card content as above */}
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter((p) => p.status === "completed")
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

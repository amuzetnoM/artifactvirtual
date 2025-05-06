"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, FileText, Terminal } from "lucide-react"

export function ProjectsOverview() {
  const activeProjects = [
    {
      name: "Meteor Markdown Editor",
      description: "AI-enhanced markdown editing and publishing platform",
      status: "active",
      progress: 65,
      type: "application",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Community Contributions",
      description: "Open-source contributions and community engagement",
      status: "active",
      progress: 40,
      type: "community",
      icon: <Code className="h-5 w-5" />,
    },
  ]

  const completedProjects = [
    {
      name: "Workspace Bootstrap",
      description: "Cross-platform setup automation",
      status: "completed",
      progress: 100,
      type: "infrastructure",
      icon: <Terminal className="h-5 w-5" />,
    },
    {
      name: "DevContainer Integration",
      description: "Reproducible development environments",
      status: "completed",
      progress: 100,
      type: "infrastructure",
      icon: <Code className="h-5 w-5" />,
    },
    {
      name: "Oracle CLI",
      description: "Multimodal LLM playground with model chaining",
      status: "completed",
      progress: 100,
      type: "application",
      icon: <Terminal className="h-5 w-5" />,
    },
    {
      name: "Temporal Calendar",
      description: "Specialized time management system",
      status: "completed",
      progress: 100,
      type: "application",
      icon: <FileText className="h-5 w-5" />,
    },
  ]

  const plannedProjects = [
    {
      name: "LLM Fine-tuning Pipelines",
      description: "Simplified workflows for adapting models to specific domains",
      status: "planned",
      progress: 0,
      type: "ai",
      icon: <Terminal className="h-5 w-5" />,
    },
    {
      name: "Distributed Agent Systems",
      description: "Frameworks for creating multi-agent AI systems",
      status: "planned",
      progress: 0,
      type: "ai",
      icon: <Code className="h-5 w-5" />,
    },
    {
      name: "Research & Philosophy Docs",
      description: "Expanded philosophy and technical foundations",
      status: "planned",
      progress: 0,
      type: "documentation",
      icon: <FileText className="h-5 w-5" />,
    },
  ]

  const renderProjectCard = (project: any) => (
    <Card key={project.name} className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {project.icon}
            <CardTitle className="text-base">{project.name}</CardTitle>
          </div>
          <Badge
            className={
              project.status === "active"
                ? "bg-blue-500"
                : project.status === "completed"
                  ? "bg-green-500"
                  : "bg-gray-500"
            }
          >
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
        {project.progress < 100 && (
          <div className="w-full bg-secondary rounded-full h-2 mb-4">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Badge variant="outline">{project.type}</Badge>
          <Button variant="ghost" size="sm" className="gap-1">
            Details <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="active" className="space-y-4">
      <TabsList>
        <TabsTrigger value="active">Active Projects</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="planned">Planned</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">{activeProjects.map(renderProjectCard)}</div>
      </TabsContent>
      <TabsContent value="completed" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{completedProjects.map(renderProjectCard)}</div>
      </TabsContent>
      <TabsContent value="planned" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{plannedProjects.map(renderProjectCard)}</div>
      </TabsContent>
    </Tabs>
  )
}

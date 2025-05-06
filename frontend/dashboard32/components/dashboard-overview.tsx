"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusCard } from "@/components/status-card"
import { MilestoneTable } from "@/components/milestone-table"
import { ProjectsOverview } from "@/components/projects-overview"
import { SystemMetrics } from "@/components/system-metrics"
import { Terminal, Brain, FileText, Code } from "lucide-react"

export function DashboardOverview() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Workspace Bootstrap"
          status="operational"
          description="Environment setup and configuration"
          icon="check"
        />
        <StatusCard
          title="Knowledge Foundations"
          status="operational"
          description="Structured data and information"
          icon="book"
        />
        <StatusCard
          title="AI Ecosystems"
          status="operational"
          description="Model integration and deployment"
          icon="brain"
        />
        <StatusCard title="Applications" status="active" description="Tools and utilities in development" icon="code" />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Currently in development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Meteor Markdown Editor, Community Contributions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Completed Projects</CardTitle>
                <CardDescription>Successfully delivered</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Workspace Bootstrap, DevContainer Integration, and more</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Planned Projects</CardTitle>
                <CardDescription>Upcoming development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  LLM Fine-tuning, Distributed Agent Systems, Research Docs
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System</span>
                    <span className="text-sm font-medium">Linux</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Version</span>
                    <span className="text-sm font-medium">2.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <span className="text-sm font-medium text-green-500">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Update</span>
                    <span className="text-sm font-medium">2024-05-04</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Card className="flex flex-col items-center justify-center p-4 hover:bg-accent cursor-pointer">
                    <Terminal className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">Run Diagnostics</span>
                  </Card>
                  <Card className="flex flex-col items-center justify-center p-4 hover:bg-accent cursor-pointer">
                    <Brain className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">Launch Oracle</span>
                  </Card>
                  <Card className="flex flex-col items-center justify-center p-4 hover:bg-accent cursor-pointer">
                    <FileText className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">Open Meteor</span>
                  </Card>
                  <Card className="flex flex-col items-center justify-center p-4 hover:bg-accent cursor-pointer">
                    <Code className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">New Project</span>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="milestones" className="space-y-4">
          <MilestoneTable />
        </TabsContent>
        <TabsContent value="projects" className="space-y-4">
          <ProjectsOverview />
        </TabsContent>
        <TabsContent value="system" className="space-y-4">
          <SystemMetrics />
        </TabsContent>
      </Tabs>
    </div>
  )
}

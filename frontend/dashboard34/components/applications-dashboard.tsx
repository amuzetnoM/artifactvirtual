"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, Play, Settings, Terminal } from "lucide-react"
import Link from "next/link"

export function ApplicationsDashboard() {
  const applications = [
    {
      name: "Meteor Markdown Editor",
      description: "AI-enhanced markdown editing and publishing platform",
      icon: <FileText className="h-12 w-12 text-primary" />,
      status: "active",
      lastUsed: "2024-05-03",
      features: ["AI Completion", "Syntax Highlighting", "Export Options"],
      path: "/applications/meteor",
    },
    {
      name: "Oracle CLI",
      description: "Multimodal LLM playground with model chaining and plugin system",
      icon: <Terminal className="h-12 w-12 text-primary" />,
      status: "operational",
      lastUsed: "2024-05-02",
      features: ["Model Chaining", "Multimodal Processing", "Plugin System"],
      path: "/applications/oracle",
    },
    {
      name: "Temporal Calendar",
      description: "Specialized time management system",
      icon: <Calendar className="h-12 w-12 text-primary" />,
      status: "operational",
      lastUsed: "2024-04-28",
      features: ["Event Tracking", "Causal Connections", "Timeline Visualization"],
      path: "/applications/calendar",
    },
    {
      name: "Simulation Manager",
      description: "Framework for adaptive error handling and system simulation",
      icon: <Settings className="h-12 w-12 text-primary" />,
      status: "operational",
      lastUsed: "2024-04-25",
      features: ["Error Simulation", "Threshold Testing", "Autonomous Adaptation"],
      path: "/applications/simulation",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight"></h2>
        <Button className="gap-2">
          <Settings className="h-4 w-4" /> Configure
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {applications.map((app) => (
          <Card key={app.name} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {app.icon}
                  <div>
                    <CardTitle>{app.name}</CardTitle>
                    <CardDescription className="mt-1">{app.description}</CardDescription>
                  </div>
                </div>
                <Badge
                  className={
                    app.status === "operational"
                      ? "bg-green-500"
                      : app.status === "active"
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                  }
                >
                  {app.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Features:</p>
                <div className="flex flex-wrap gap-2">
                  {app.features.map((feature) => (
                    <Badge key={feature} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Last used: {app.lastUsed}</p>
                <Link href={app.path}>
                  <Button className="gap-2">
                    <Play className="h-4 w-4" /> Launch
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Logs</CardTitle>
          <CardDescription>Recent application activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-xs">
            <div className="rounded bg-muted p-2">
              <span className="text-blue-500">[2024-05-03 15:22:45]</span> Meteor Editor: Document "Advanced Prompt
              Engineering" saved
            </div>
            <div className="rounded bg-muted p-2">
              <span className="text-blue-500">[2024-05-02 10:15:30]</span> Oracle CLI: Completed chain execution with
              models phi4-mini → gemma3
            </div>
            <div className="rounded bg-muted p-2">
              <span className="text-blue-500">[2024-05-02 09:45:12]</span> Oracle CLI: Started with model phi4-mini
            </div>
            <div className="rounded bg-muted p-2">
              <span className="text-blue-500">[2024-04-28 14:30:22]</span> Temporal Calendar: Added 3 new events to
              timeline
            </div>
            <div className="rounded bg-muted p-2">
              <span className="text-blue-500">[2024-04-25 11:10:05]</span> Simulation Manager: Completed error threshold
              testing
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity, Database, Plus, Power, Server, Settings, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { v4 as uuidv4 } from "uuid"

interface ServerConfig {
  id: string
  name: string
  type: "data" | "sensory" | "mcp"
  endpoint: string
  status: "online" | "offline" | "error"
  port: number
  secure: boolean
  createdAt: Date
  lastActive?: Date
  description?: string
}

export function ServerManagementDashboard() {
  const [servers, setServers] = React.useState<ServerConfig[]>([
    {
      id: uuidv4(),
      name: "Primary Data Server",
      type: "data",
      endpoint: "http://localhost:8000",
      status: "online",
      port: 8000,
      secure: false,
      createdAt: new Date(2024, 3, 15),
      lastActive: new Date(),
      description: "Main data storage and retrieval server",
    },
    {
      id: uuidv4(),
      name: "Vision Sensory Server",
      type: "sensory",
      endpoint: "http://localhost:8001",
      status: "online",
      port: 8001,
      secure: false,
      createdAt: new Date(2024, 4, 1),
      lastActive: new Date(),
      description: "Processes visual input for AI models",
    },
    {
      id: uuidv4(),
      name: "Master Control Program",
      type: "mcp",
      endpoint: "https://mcp.example.com",
      status: "offline",
      port: 443,
      secure: true,
      createdAt: new Date(2024, 4, 10),
      description: "Coordinates all server activities and manages resources",
    },
  ])

  const [newServer, setNewServer] = React.useState<Partial<ServerConfig>>({
    name: "",
    type: "data",
    endpoint: "",
    port: 8000,
    secure: false,
    description: "",
  })

  const addServer = () => {
    const server: ServerConfig = {
      id: uuidv4(),
      name: newServer.name || "New Server",
      type: newServer.type as "data" | "sensory" | "mcp",
      endpoint: newServer.secure
        ? `https://${newServer.endpoint || "localhost"}:${newServer.port}`
        : `http://${newServer.endpoint || "localhost"}:${newServer.port}`,
      status: "offline",
      port: newServer.port || 8000,
      secure: newServer.secure || false,
      createdAt: new Date(),
      description: newServer.description,
    }

    setServers([...servers, server])
    setNewServer({
      name: "",
      type: "data",
      endpoint: "",
      port: 8000,
      secure: false,
      description: "",
    })
  }

  const toggleServerStatus = (id: string) => {
    setServers(
      servers.map((server) => {
        if (server.id === id) {
          const newStatus = server.status === "online" ? "offline" : "online"
          return {
            ...server,
            status: newStatus,
            lastActive: newStatus === "online" ? new Date() : server.lastActive,
          }
        }
        return server
      }),
    )
  }

  const deleteServer = (id: string) => {
    setServers(servers.filter((server) => server.id !== id))
  }

  const getServerTypeIcon = (type: string) => {
    switch (type) {
      case "data":
        return <Database className="h-4 w-4" />
      case "sensory":
        return <Activity className="h-4 w-4" />
      case "mcp":
        return <Server className="h-4 w-4" />
      default:
        return <Server className="h-4 w-4" />
    }
  }

  const getServerTypeLabel = (type: string) => {
    switch (type) {
      case "data":
        return "Data Server"
      case "sensory":
        return "Sensory Server"
      case "mcp":
        return "MCP Server"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-text">Server Management</h2>
          <p className="text-muted-foreground"></p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Server
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Server</DialogTitle>
              <DialogDescription>Configure a new server for your Artifact Virtual environment.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Server Name</Label>
                <Input
                  id="name"
                  value={newServer.name}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                  placeholder="e.g., Primary Data Server"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Server Type</Label>
                <Select
                  value={newServer.type}
                  onValueChange={(value) => setNewServer({ ...newServer, type: value as "data" | "sensory" | "mcp" })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select server type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data">Data Server</SelectItem>
                    <SelectItem value="sensory">Sensory Server</SelectItem>
                    <SelectItem value="mcp">MCP Server</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="endpoint">Hostname</Label>
                  <Input
                    id="endpoint"
                    value={newServer.endpoint}
                    onChange={(e) => setNewServer({ ...newServer, endpoint: e.target.value })}
                    placeholder="e.g., localhost"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={newServer.port}
                    onChange={(e) => setNewServer({ ...newServer, port: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="secure"
                  checked={newServer.secure}
                  onCheckedChange={(checked) => setNewServer({ ...newServer, secure: checked })}
                />
                <Label htmlFor="secure">Use HTTPS</Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newServer.description}
                  onChange={(e) => setNewServer({ ...newServer, description: e.target.value })}
                  placeholder="Brief description of the server's purpose"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={addServer}>
                Add Server
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Servers</TabsTrigger>
          <TabsTrigger value="data">Data Servers</TabsTrigger>
          <TabsTrigger value="sensory">Sensory Servers</TabsTrigger>
          <TabsTrigger value="mcp">MCP Servers</TabsTrigger>
        </TabsList>

        {["all", "data", "sensory", "mcp"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servers
                .filter((server) => tabValue === "all" || server.type === tabValue)
                .map((server) => (
                  <Card key={server.id} className="overflow-hidden card-hover">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-full ${
                              server.type === "data"
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                                : server.type === "sensory"
                                  ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                                  : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            }`}
                          >
                            {getServerTypeIcon(server.type)}
                          </div>
                          <CardTitle className="text-base">{server.name}</CardTitle>
                        </div>
                        <Badge
                          className={
                            server.status === "online"
                              ? "bg-green-500"
                              : server.status === "offline"
                                ? "bg-gray-500"
                                : "bg-red-500"
                          }
                        >
                          {server.status}
                        </Badge>
                      </div>
                      <CardDescription>{server.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium">{getServerTypeLabel(server.type)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Endpoint:</span>
                          <span className="font-mono text-xs">{server.endpoint}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Created:</span>
                          <span>{server.createdAt.toLocaleDateString()}</span>
                        </div>
                        {server.lastActive && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Last Active:</span>
                            <span>{server.lastActive.toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant={server.status === "online" ? "destructive" : "default"}
                          className="flex-1 gap-1"
                          onClick={() => toggleServerStatus(server.id)}
                        >
                          <Power className="h-4 w-4" />
                          {server.status === "online" ? "Stop" : "Start"}
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Settings className="h-4 w-4" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline" className="w-9 p-0" onClick={() => deleteServer(server.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {servers.filter((server) => tabValue === "all" || server.type === tabValue).length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Server className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No {tabValue !== "all" ? `${tabValue} ` : ""}servers found
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  {tabValue !== "all"
                    ? `Add a ${tabValue} server to start managing your ${
                        tabValue === "data"
                          ? "data storage and retrieval"
                          : tabValue === "sensory"
                            ? "sensory input processing"
                            : "master control program"
                      } capabilities.`
                    : "Add servers to start managing your Artifact Virtual environment."}
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" /> Add Server
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">{/* Dialog content same as above */}</DialogContent>
                </Dialog>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

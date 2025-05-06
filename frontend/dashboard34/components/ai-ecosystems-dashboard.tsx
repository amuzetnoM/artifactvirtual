"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Download, Settings } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function AIEcosystemsDashboard() {
  const models = [
    {
      name: "phi4-mini",
      description: "Lightweight general-purpose model",
      provider: "Ollama",
      size: "1.3 GB",
      status: "loaded",
      quantization: "4-bit",
    },
    {
      name: "gemma3",
      description: "Mid-sized reasoning and instruction model",
      provider: "Ollama",
      size: "3.8 GB",
      status: "loaded",
      quantization: "8-bit",
    },
    {
      name: "llava",
      description: "Multimodal vision-language model",
      provider: "Ollama",
      size: "4.2 GB",
      status: "available",
      quantization: "none",
    },
    {
      name: "gpt-4o",
      description: "Advanced reasoning and instruction model",
      provider: "OpenAI",
      size: "N/A",
      status: "available",
      quantization: "N/A",
    },
  ]

  const quantizationJobs = [
    {
      model: "Qwen/Qwen3-0.6B",
      status: "completed",
      bits: 4,
      groupSize: 128,
      progress: 100,
      startTime: "2024-04-28 14:32:15",
      endTime: "2024-04-28 15:10:42",
    },
    {
      model: "microsoft/phi-2",
      status: "completed",
      bits: 4,
      groupSize: 128,
      progress: 100,
      startTime: "2024-04-30 09:15:22",
      endTime: "2024-04-30 10:05:18",
    },
  ]

  const mcpServers = [
    {
      name: "Simple Prompt Server",
      endpoint: "http://localhost:8000/prompt",
      status: "running",
      type: "prompt",
      requests: 152,
    },
    {
      name: "Knowledge Base Server",
      endpoint: "http://localhost:8001/kb",
      status: "running",
      type: "knowledge",
      requests: 87,
    },
    {
      name: "Tool Calling Server",
      endpoint: "http://localhost:8002/tools",
      status: "stopped",
      type: "tools",
      requests: 0,
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

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="quantization">AutoRound</TabsTrigger>
          <TabsTrigger value="mcp">Model Context Protocol</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {models.map((model) => (
              <Card key={model.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <CardTitle>{model.name}</CardTitle>
                    </div>
                    <Badge
                      className={
                        model.status === "loaded"
                          ? "bg-green-500"
                          : model.status === "available"
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                      }
                    >
                      {model.status}
                    </Badge>
                  </div>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Provider</p>
                      <p className="font-medium">{model.provider}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium">{model.size}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantization</p>
                      <p className="font-medium">{model.quantization}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1">
                      Use
                    </Button>
                    {model.status !== "loaded" && (
                      <Button size="sm" variant="outline" className="flex-1 gap-1">
                        <Download className="h-4 w-4" /> Load
                      </Button>
                    )}
                    {model.status === "loaded" && (
                      <Button size="sm" variant="outline" className="flex-1">
                        Unload
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Add New Model</CardTitle>
              <CardDescription>Pull a new model from a provider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="grid flex-1 gap-2">
                  <label className="text-sm font-medium">Provider</label>
                  <select className="rounded-md border border-input bg-background px-3 py-2">
                    <option>Ollama</option>
                    <option>Hugging Face</option>
                    <option>OpenAI</option>
                  </select>
                </div>
                <div className="grid flex-1 gap-2">
                  <label className="text-sm font-medium">Model</label>
                  <select className="rounded-md border border-input bg-background px-3 py-2">
                    <option>llama3</option>
                    <option>mistral</option>
                    <option>codellama</option>
                    <option>llava</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button>Pull Model</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quantization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AutoRound Quantization</CardTitle>
              <CardDescription>Advanced model quantization for efficient deployment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {quantizationJobs.map((job) => (
                    <Card key={job.model} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{job.model}</CardTitle>
                          <Badge
                            className={
                              job.status === "completed"
                                ? "bg-green-500"
                                : job.status === "running"
                                  ? "bg-blue-500"
                                  : "bg-yellow-500"
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Bits</p>
                              <p className="font-medium">{job.bits}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Group Size</p>
                              <p className="font-medium">{job.groupSize}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{job.progress}%</span>
                            </div>
                            <Progress value={job.progress} className="h-2" />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>
                              <p>Start: {job.startTime}</p>
                            </div>
                            <div>
                              <p>End: {job.endTime}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">New Quantization Job</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Model</label>
                        <input
                          className="rounded-md border border-input bg-background px-3 py-2"
                          placeholder="e.g., meta-llama/Llama-3-8B"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Bits</label>
                          <select className="rounded-md border border-input bg-background px-3 py-2">
                            <option>4</option>
                            <option>3</option>
                            <option>2</option>
                            <option>8</option>
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Group Size</label>
                          <select className="rounded-md border border-input bg-background px-3 py-2">
                            <option>128</option>
                            <option>64</option>
                            <option>32</option>
                            <option>256</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Format</label>
                        <select className="rounded-md border border-input bg-background px-3 py-2">
                          <option>auto_round</option>
                          <option>gguf</option>
                          <option>awq</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button className="w-full">Start Quantization</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mcp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Context Protocol</CardTitle>
              <CardDescription>Standardized system for providing context to LLMs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {mcpServers.map((server) => (
                    <Card key={server.name}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{server.name}</CardTitle>
                          <Badge className={server.status === "running" ? "bg-green-500" : "bg-red-500"}>
                            {server.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Endpoint</p>
                            <p className="text-sm font-mono">{server.endpoint}</p>
                          </div>
                          <div className="flex justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">Type</p>
                              <p className="text-sm">{server.type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Requests</p>
                              <p className="text-sm">{server.requests}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {server.status === "running" ? (
                              <Button size="sm" variant="outline" className="flex-1">
                                Stop
                              </Button>
                            ) : (
                              <Button size="sm" className="flex-1">
                                Start
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="flex-1">
                              Configure
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">New MCP Server</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Server Name</label>
                        <input
                          className="rounded-md border border-input bg-background px-3 py-2"
                          placeholder="e.g., Custom Knowledge Server"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Server Type</label>
                        <select className="rounded-md border border-input bg-background px-3 py-2">
                          <option>prompt</option>
                          <option>knowledge</option>
                          <option>tools</option>
                          <option>custom</option>
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Endpoint</label>
                        <input
                          className="rounded-md border border-input bg-background px-3 py-2"
                          placeholder="e.g., http://localhost:8003/custom"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button className="w-full">Create Server</Button>
                      </div>
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

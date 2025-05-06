"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Activity, Cpu, Database, HardDrive, MemoryStickIcon as Memory, Server } from "lucide-react"

export function SystemMetrics() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "24%" }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">4 cores / 8 threads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Memory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "42%" }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">6.7 GB / 16 GB</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "68%" }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">340 GB / 500 GB</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 MB/s</div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>↑ 0.8 MB/s</span>
              <span>↓ 1.6 MB/s</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Services</CardTitle>
              <CardDescription>Status of running services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Ollama LLM Server</p>
                      <p className="text-xs text-muted-foreground">Local model inference</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Running</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">PostgreSQL Database</p>
                      <p className="text-xs text-muted-foreground">Knowledge storage</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Running</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Model Context Protocol</p>
                      <p className="text-xs text-muted-foreground">Context provision</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Running</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">AutoRound Service</p>
                      <p className="text-xs text-muted-foreground">Model quantization</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-500">Idle</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation</CardTitle>
              <CardDescription>System resource usage by component</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Ollama LLM Server</p>
                    <p className="text-sm">2.1 GB</p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "32%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">PostgreSQL Database</p>
                    <p className="text-sm">0.8 GB</p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "12%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Model Context Protocol</p>
                    <p className="text-sm">0.4 GB</p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "6%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">System & Other</p>
                    <p className="text-sm">3.4 GB</p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-gray-500 h-2 rounded-full" style={{ width: "50%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-xs">
                <div className="rounded bg-muted p-2">
                  <span className="text-green-500">[2024-05-04 07:45:12]</span> System startup completed successfully
                </div>
                <div className="rounded bg-muted p-2">
                  <span className="text-blue-500">[2024-05-04 07:45:30]</span> Ollama service started with models:
                  phi4-mini, gemma3
                </div>
                <div className="rounded bg-muted p-2">
                  <span className="text-blue-500">[2024-05-04 07:46:05]</span> PostgreSQL database connected
                  successfully
                </div>
                <div className="rounded bg-muted p-2">
                  <span className="text-yellow-500">[2024-05-04 07:50:22]</span> Model Context Protocol initialized with
                  3 providers
                </div>
                <div className="rounded bg-muted p-2">
                  <span className="text-blue-500">[2024-05-04 08:01:15]</span> User session started: admin
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

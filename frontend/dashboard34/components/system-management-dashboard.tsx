"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Cpu,
  Download,
  Fan,
  HardDrive,
  MemoryStickIcon as Memory,
  RefreshCw,
  Settings,
  Thermometer,
  Upload,
  Brain,
  Database,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function SystemManagementDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-text"></h2>
          <p className="text-muted-foreground"></p>
        </div>
        <Button className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Memory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>10.9 GB / 16 GB</span>
                <span>68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">5.1 GB available</p>
          </CardContent>
        </Card>

        <Card className="border-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
          </CardContent>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>3.4 GB / 8 GB VRAM</span>
                <span>42%</span>
              </div>
              <Progress value={42} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">4.6 GB VRAM available</p>
          </CardContent>
        </Card>

        <Card className="border-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76%</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>380 GB / 500 GB</span>
                <span>76%</span>
              </div>
              <Progress value={76} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">120 GB available</p>
          </CardContent>
        </Card>

        <Card className="border-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">62°C</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>CPU: 62°C</span>
                <span>GPU: 68°C</span>
              </div>
              <Progress value={62} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Fan speed: 1800 RPM</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="storage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="gpu">GPU</TabsTrigger>
          <TabsTrigger value="cooling">Cooling</TabsTrigger>
        </TabsList>

        <TabsContent value="storage" className="space-y-4">
          <Card className="border-glow">
            <CardHeader>
              <CardTitle>Storage Management</CardTitle>
              <CardDescription>Manage disk space and file storage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="p-4">
                    <h3 className="text-lg font-medium">Storage Devices</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Primary SSD</p>
                            <p className="text-sm text-muted-foreground">500 GB NVMe</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">380 GB used (76%)</p>
                          <p className="text-sm text-muted-foreground">120 GB free</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Secondary HDD</p>
                            <p className="text-sm text-muted-foreground">2 TB SATA</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">1.2 TB used (60%)</p>
                          <p className="text-sm text-muted-foreground">800 GB free</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Card className="flex-1 border-glow">
                    <CardHeader>
                      <CardTitle className="text-base">File Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <Button className="gap-2">
                            <Upload className="h-4 w-4" /> Upload Files
                          </Button>
                          <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" /> Download Files
                          </Button>
                        </div>
                        <div className="rounded-md border p-4">
                          <p className="text-center text-muted-foreground">
                            Drag and drop files here or use the upload button
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex-1 border-glow">
                    <CardHeader>
                      <CardTitle className="text-base">Storage Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>AI Models</span>
                          <span>120 GB</span>
                        </div>
                        <Progress value={30} className="h-2" />

                        <div className="flex justify-between">
                          <span>Datasets</span>
                          <span>85 GB</span>
                        </div>
                        <Progress value={21} className="h-2" />

                        <div className="flex justify-between">
                          <span>Documents</span>
                          <span>45 GB</span>
                        </div>
                        <Progress value={11} className="h-2" />

                        <div className="flex justify-between">
                          <span>System</span>
                          <span>130 GB</span>
                        </div>
                        <Progress value={32} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card className="border-glow">
            <CardHeader>
              <CardTitle>Memory Management</CardTitle>
              <CardDescription>Monitor and optimize RAM usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="p-4">
                    <h3 className="text-lg font-medium">Memory Usage by Process</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">AI Model Server</p>
                            <p className="text-sm text-muted-foreground">Ollama</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">4.2 GB</p>
                          <p className="text-sm text-muted-foreground">38% of total</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Database</p>
                            <p className="text-sm text-muted-foreground">PostgreSQL</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">2.1 GB</p>
                          <p className="text-sm text-muted-foreground">19% of total</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">System Processes</p>
                            <p className="text-sm text-muted-foreground">OS & Services</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">4.6 GB</p>
                          <p className="text-sm text-muted-foreground">43% of total</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Optimize Memory
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" /> Memory Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gpu" className="space-y-4">
          <Card className="border-glow">
            <CardHeader>
              <CardTitle>GPU Management</CardTitle>
              <CardDescription>Monitor and optimize GPU resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="p-4">
                    <h3 className="text-lg font-medium">GPU Usage by Process</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">AI Model Inference</p>
                            <p className="text-sm text-muted-foreground">Llama 3</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">2.8 GB VRAM</p>
                          <p className="text-sm text-muted-foreground">35% of total</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">CUDA Processes</p>
                            <p className="text-sm text-muted-foreground">System</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">0.6 GB VRAM</p>
                          <p className="text-sm text-muted-foreground">7% of total</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Optimize GPU
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" /> GPU Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cooling" className="space-y-4">
          <Card className="border-glow">
            <CardHeader>
              <CardTitle>System Cooling</CardTitle>
              <CardDescription>Monitor and manage system temperature</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="p-4">
                    <h3 className="text-lg font-medium">Temperature Sensors</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">CPU Temperature</p>
                            <p className="text-sm text-muted-foreground">Intel Core i9</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">62°C</p>
                          <p className="text-sm text-muted-foreground">Normal</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">GPU Temperature</p>
                            <p className="text-sm text-muted-foreground">NVIDIA RTX 4080</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">68°C</p>
                          <p className="text-sm text-muted-foreground">Normal</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Fan className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Fan Speed</p>
                            <p className="text-sm text-muted-foreground">System Fans</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">1800 RPM</p>
                          <p className="text-sm text-muted-foreground">Auto</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="gap-2">
                    <Fan className="h-4 w-4" /> Boost Cooling
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" /> Fan Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

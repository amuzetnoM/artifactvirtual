import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Brain, PlayCircle, Pause, Cpu, Server, BarChart, ChevronRight, Info } from "lucide-react"

export default function AILabPage() {
  // Sample experiment data
  const experiments = [
    {
      id: "1",
      name: "Transformer Fine-tuning",
      description: "Fine-tuning large language model on custom dataset",
      status: "Running",
      progress: 72,
      runtime: "12h 34m",
      resources: "4x A100 GPUs",
      framework: "PyTorch",
      createdAt: "2024-05-05"
    },
    {
      id: "2",
      name: "Image Generation",
      description: "Training diffusion model for specialized image generation",
      status: "Completed",
      progress: 100,
      runtime: "8h 12m",
      resources: "8x A100 GPUs",
      framework: "PyTorch",
      createdAt: "2024-05-03"
    },
    {
      id: "3",
      name: "Multi-agent Simulation",
      description: "Testing emergent behaviors in multi-agent environments",
      status: "Paused",
      progress: 45,
      runtime: "3h 55m",
      resources: "16x CPU cores",
      framework: "TensorFlow",
      createdAt: "2024-05-07"
    },
    {
      id: "4",
      name: "Reinforcement Learning",
      description: "Training RL agents for complex decision-making tasks",
      status: "Queued",
      progress: 0,
      runtime: "-",
      resources: "2x A100 GPUs",
      framework: "JAX",
      createdAt: "2024-05-08"
    }
  ]

  // Resource utilization
  const resources = {
    gpuUtilization: 82,
    cpuUtilization: 68,
    memoryUsage: 76,
    diskUsage: 42
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight gradient-text">AI Lab</h2>
            <p className="text-muted-foreground">Research and experimentation environment for AI models</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Resource Manager</Button>
            <Button className="gap-2">
              <Brain className="h-4 w-4" /> New Experiment
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Experiments</TabsTrigger>
                <TabsTrigger value="running">Running</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="paused">Paused</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {experiments.map((experiment) => (
                  <Card key={experiment.id} className="overflow-hidden border-glow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{experiment.name}</CardTitle>
                        <Badge
                          className={
                            experiment.status === "Running"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : experiment.status === "Completed"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : experiment.status === "Paused"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }
                        >
                          {experiment.status}
                        </Badge>
                      </div>
                      <CardDescription>{experiment.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span>{experiment.progress}%</span>
                          </div>
                          <Progress value={experiment.progress} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Runtime:</span> {experiment.runtime}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Resources:</span> {experiment.resources}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Framework:</span> {experiment.framework}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Created:</span> {experiment.createdAt}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 border-t bg-muted/10 px-6 py-3">
                      <Button size="sm" className="flex-1 gap-1">
                        <ChevronRight className="h-4 w-4" /> View Details
                      </Button>
                      {experiment.status === "Running" ? (
                        <Button size="sm" variant="outline" className="gap-1">
                          <Pause className="h-4 w-4" /> Pause
                        </Button>
                      ) : experiment.status === "Paused" || experiment.status === "Queued" ? (
                        <Button size="sm" variant="outline" className="gap-1">
                          <PlayCircle className="h-4 w-4" /> Start
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="gap-1">
                          <Info className="h-4 w-4" /> Results
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="running" className="space-y-4">
                {experiments.filter(e => e.status === "Running").map((experiment) => (
                  <Card key={experiment.id} className="overflow-hidden border-glow">
                    {/* Same card content as above */}
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="completed" className="space-y-4">
                {experiments.filter(e => e.status === "Completed").map((experiment) => (
                  <Card key={experiment.id} className="overflow-hidden border-glow">
                    {/* Same card content as above */}
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="paused" className="space-y-4">
                {experiments.filter(e => e.status === "Paused" || e.status === "Queued").map((experiment) => (
                  <Card key={experiment.id} className="overflow-hidden border-glow">
                    {/* Same card content as above */}
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Current system resource usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Cpu className="mr-2 h-4 w-4 text-blue-500" /> 
                      <span>GPU Utilization</span>
                    </div>
                    <span>{resources.gpuUtilization}%</span>
                  </div>
                  <Progress value={resources.gpuUtilization} className="h-2 bg-muted" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Server className="mr-2 h-4 w-4 text-green-500" /> 
                      <span>CPU Utilization</span>
                    </div>
                    <span>{resources.cpuUtilization}%</span>
                  </div>
                  <Progress value={resources.cpuUtilization} className="h-2 bg-muted" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <BarChart className="mr-2 h-4 w-4 text-amber-500" /> 
                      <span>Memory Usage</span>
                    </div>
                    <span>{resources.memoryUsage}%</span>
                  </div>
                  <Progress value={resources.memoryUsage} className="h-2 bg-muted" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Server className="mr-2 h-4 w-4 text-purple-500" /> 
                      <span>Storage Usage</span>
                    </div>
                    <span>{resources.diskUsage}%</span>
                  </div>
                  <Progress value={resources.diskUsage} className="h-2 bg-muted" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View Detailed Metrics
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common lab operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <PlayCircle className="mr-2 h-4 w-4" /> Start All Paused
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Pause className="mr-2 h-4 w-4" /> Pause All Running
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Brain className="mr-2 h-4 w-4" /> Load Model
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Info className="mr-2 h-4 w-4" /> Export Results
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

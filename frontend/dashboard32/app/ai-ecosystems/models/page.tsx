import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Brain, Download, ExternalLink, Clock, Info, ChevronDown, Layers, FileCode, Server } from "lucide-react"

export default function AIModelsPage() {
  // Sample models data
  const models = [
    {
      id: "1",
      name: "TransformerLLM-7B",
      description: "General purpose language model with 7B parameters",
      type: "Language",
      size: "7B",
      framework: "PyTorch",
      lastUpdated: "2024-05-02",
      status: "Ready",
      quantized: false,
      license: "Apache 2.0"
    },
    {
      id: "2",
      name: "DiffusionXL",
      description: "High-quality image generation model with controlnet support",
      type: "Image",
      size: "2.5B",
      framework: "PyTorch",
      lastUpdated: "2024-04-28",
      status: "Ready",
      quantized: true,
      license: "MIT"
    },
    {
      id: "3",
      name: "TransformerLLM-13B",
      description: "Advanced language model with improved reasoning capabilities",
      type: "Language",
      size: "13B",
      framework: "PyTorch",
      lastUpdated: "2024-05-04",
      status: "Downloading",
      quantized: false,
      license: "Apache 2.0"
    },
    {
      id: "4",
      name: "BERT-Embeddings",
      description: "Contextual word embeddings for semantic search",
      type: "Embedding",
      size: "330M",
      framework: "TensorFlow",
      lastUpdated: "2024-04-15",
      status: "Ready",
      quantized: true,
      license: "MIT"
    },
    {
      id: "5",
      name: "AudioTranscriber",
      description: "Speech-to-text transcription model",
      type: "Audio",
      size: "1.2B",
      framework: "JAX",
      lastUpdated: "2024-05-01",
      status: "Ready",
      quantized: true,
      license: "CC BY-NC-SA"
    },
    {
      id: "6",
      name: "VideoGen",
      description: "Video generation model from text prompts",
      type: "Video",
      size: "4.8B",
      framework: "PyTorch",
      lastUpdated: "2024-05-05",
      status: "Downloading",
      quantized: false,
      license: "Research Only"
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight gradient-text">AI Models</h2>
            <p className="text-muted-foreground">Manage and deploy AI models in your ecosystem</p>
          </div>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search models..." className="w-full pl-8" />
            </div>
            <Button className="gap-2">
              <Download className="h-4 w-4" /> Import Model
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Models</TabsTrigger>
            <TabsTrigger value="language">Language</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {models.map((model) => (
                <Card key={model.id} className="overflow-hidden card-hover border-glow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          model.type === "Language"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : model.type === "Image"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : model.type === "Audio"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                                : model.type === "Video"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }
                      >
                        {model.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          model.status === "Ready"
                            ? "border-green-500 text-green-500"
                            : "border-amber-500 text-amber-500"
                        }
                      >
                        {model.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <CardDescription>{model.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Layers className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Size:</span>
                      </div>
                      <div>{model.size} parameters</div>
                      
                      <div className="flex items-center gap-1">
                        <FileCode className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Framework:</span>
                      </div>
                      <div>{model.framework}</div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Updated:</span>
                      </div>
                      <div>{model.lastUpdated}</div>
                      
                      <div className="flex items-center gap-1">
                        <Server className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Quantized:</span>
                      </div>
                      <div>{model.quantized ? "Yes" : "No"}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t bg-muted/10 px-6 py-3">
                    <Button size="sm" className="flex-1 gap-1">
                      <Brain className="h-4 w-4" /> Deploy
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1">
                      <ExternalLink className="h-4 w-4" /> Details
                    </Button>
                    <Button size="sm" variant="ghost" className="w-9 p-0">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="language" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {models.filter(m => m.type === "Language").map((model) => (
                <Card key={model.id} className="overflow-hidden card-hover border-glow">
                  {/* Same card content as above */}
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {models.filter(m => m.type === "Image").map((model) => (
                <Card key={model.id} className="overflow-hidden card-hover border-glow">
                  {/* Same card content as above */}
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="audio" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {models.filter(m => m.type === "Audio").map((model) => (
                <Card key={model.id} className="overflow-hidden card-hover border-glow">
                  {/* Same card content as above */}
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="video" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {models.filter(m => m.type === "Video").map((model) => (
                <Card key={model.id} className="overflow-hidden card-hover border-glow">
                  {/* Same card content as above */}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
} 
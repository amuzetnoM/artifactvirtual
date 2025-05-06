"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, FolderOpen, Plus, Search, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"

export function KnowledgeDashboard() {
  const datasets = [
    {
      name: "core_facts.json",
      description: "Core reference information",
      size: "2.4 MB",
      entries: 1250,
      lastUpdated: "2024-04-15",
      type: "json",
    },
    {
      name: "reasoning_patterns.json",
      description: "Logical reasoning structures",
      size: "1.8 MB",
      entries: 850,
      lastUpdated: "2024-04-10",
      type: "json",
    },
    {
      name: "language_primitives.json",
      description: "Fundamental language constructs",
      size: "3.2 MB",
      entries: 1500,
      lastUpdated: "2024-03-28",
      type: "json",
    },
    {
      name: "temporal_events.json",
      description: "Event sequences and causal connections",
      size: "4.1 MB",
      entries: 2200,
      lastUpdated: "2024-04-22",
      type: "json",
    },
  ]

  const libraryCategories = [
    {
      name: "Fundamental Concepts",
      description: "Core principles and foundational knowledge",
      documents: 24,
      lastUpdated: "2024-04-18",
    },
    {
      name: "Technical References",
      description: "Detailed technical specifications and guides",
      documents: 42,
      lastUpdated: "2024-04-25",
    },
    {
      name: "Research Papers",
      description: "Academic research and publications",
      documents: 18,
      lastUpdated: "2024-03-30",
    },
    {
      name: "Historical Context",
      description: "Historical development and evolution",
      documents: 15,
      lastUpdated: "2024-02-15",
    },
  ]

  const recentDocuments = [
    {
      title: "Transformer Architecture Explained",
      category: "Technical References",
      author: "A. Researcher",
      lastUpdated: "2024-04-28",
      format: "markdown",
    },
    {
      title: "Quantization Techniques for LLMs",
      category: "Technical References",
      author: "B. Engineer",
      lastUpdated: "2024-04-25",
      format: "markdown",
    },
    {
      title: "History of Neural Networks",
      category: "Historical Context",
      author: "C. Historian",
      lastUpdated: "2024-04-20",
      format: "markdown",
    },
    {
      title: "Causal Inference in Machine Learning",
      category: "Research Papers",
      author: "D. Scientist",
      lastUpdated: "2024-04-15",
      format: "pdf",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight"></h2>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search knowledge base..." className="w-full pl-8" />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Knowledge
          </Button>
        </div>
      </div>

      <Tabs defaultValue="datasets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {datasets.map((dataset) => (
              <Card key={dataset.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{dataset.name}</CardTitle>
                    </div>
                    <Badge variant="outline">{dataset.type}</Badge>
                  </div>
                  <CardDescription>{dataset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium">{dataset.size}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Entries</p>
                      <p className="font-medium">{dataset.entries}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{dataset.lastUpdated}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Import Dataset</CardTitle>
              <CardDescription>Add a new dataset to the knowledge foundation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Dataset Name</label>
                  <input
                    className="rounded-md border border-input bg-background px-3 py-2"
                    placeholder="e.g., domain_knowledge.json"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Dataset Type</label>
                  <select className="rounded-md border border-input bg-background px-3 py-2">
                    <option>JSON</option>
                    <option>CSV</option>
                    <option>JSONL</option>
                    <option>YAML</option>
                  </select>
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <input
                    className="rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Brief description of the dataset"
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm font-medium">File</label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" /> Choose File
                    </Button>
                    <span className="text-sm text-muted-foreground">No file chosen</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Button>Import Dataset</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {libraryCategories.map((category) => (
              <Card key={category.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{category.name}</CardTitle>
                    </div>
                    <Badge variant="outline">{category.documents} docs</Badge>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Documents</p>
                      <p className="font-medium">{category.documents}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{category.lastUpdated}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Browse
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Add Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Category</CardTitle>
              <CardDescription>Add a new category to the knowledge library</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Category Name</label>
                  <input
                    className="rounded-md border border-input bg-background px-3 py-2"
                    placeholder="e.g., Case Studies"
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <input
                    className="rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Brief description of the category"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button>Create Category</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Recently updated knowledge documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">Title</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Category</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Author</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Last Updated</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Format</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDocuments.map((doc) => (
                      <tr key={doc.title} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium">{doc.title}</td>
                        <td className="p-4 align-middle">{doc.category}</td>
                        <td className="p-4 align-middle">{doc.author}</td>
                        <td className="p-4 align-middle">{doc.lastUpdated}</td>
                        <td className="p-4 align-middle">
                          <Badge variant="outline">{doc.format}</Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex gap-2">
                            <Button size="sm">View</Button>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Document</CardTitle>
              <CardDescription>Create a new knowledge document</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Title</label>
                  <input
                    className="rounded-md border border-input bg-background px-3 py-2"
                    placeholder="e.g., Advanced Prompt Engineering"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Category</label>
                  <select className="rounded-md border border-input bg-background px-3 py-2">
                    <option>Technical References</option>
                    <option>Fundamental Concepts</option>
                    <option>Research Papers</option>
                    <option>Historical Context</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Author</label>
                  <input
                    className="rounded-md border border-input bg-background px-3 py-2"
                    placeholder="e.g., Your Name"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Format</label>
                  <select className="rounded-md border border-input bg-background px-3 py-2">
                    <option>markdown</option>
                    <option>pdf</option>
                    <option>html</option>
                  </select>
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm font-medium">Content</label>
                  <textarea
                    className="min-h-32 rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Document content or upload a file"
                  ></textarea>
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm font-medium">Or Upload File</label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" /> Choose File
                    </Button>
                    <span className="text-sm text-muted-foreground">No file chosen</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Button>Create Document</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

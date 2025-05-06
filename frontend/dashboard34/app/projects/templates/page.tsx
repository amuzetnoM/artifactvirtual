import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, CodeSquare, Clock, Users, Braces, GitBranch, Atom, Database } from "lucide-react"

export default function ProjectTemplatesPage() {
  const templates = [
    {
      id: "1",
      name: "AI Research Project",
      description: "Template for AI research and experimentation projects with model training workflow.",
      icon: <Braces className="h-12 w-12 text-blue-500" />,
      category: "AI & ML",
      popularity: "High",
      lastUpdated: "2 days ago",
    },
    {
      id: "2",
      name: "Blockchain Development",
      description: "Setup for blockchain development with smart contract templates and testing environment.",
      icon: <GitBranch className="h-12 w-12 text-green-500" />,
      category: "Blockchain",
      popularity: "Medium",
      lastUpdated: "1 week ago",
    },
    {
      id: "3",
      name: "Quantum Computing",
      description: "Environment for quantum algorithm development and simulation.",
      icon: <Atom className="h-12 w-12 text-purple-500" />,
      category: "Quantum",
      popularity: "Low",
      lastUpdated: "3 weeks ago",
    },
    {
      id: "4",
      name: "Data Pipeline",
      description: "Template for building ETL data pipelines with monitoring and visualization.",
      icon: <Database className="h-12 w-12 text-orange-500" />,
      category: "Data",
      popularity: "High",
      lastUpdated: "5 days ago",
    },
    {
      id: "5",
      name: "Knowledge Base",
      description: "Structure for organizing research papers, notes, and references.",
      icon: <CodeSquare className="h-12 w-12 text-indigo-500" />,
      category: "Knowledge",
      popularity: "Medium",
      lastUpdated: "2 weeks ago",
    },
    {
      id: "6",
      name: "Blank Project",
      description: "Empty project template with basic file structure and configuration.",
      icon: <CodeSquare className="h-12 w-12 text-gray-500" />,
      category: "General",
      popularity: "High",
      lastUpdated: "1 day ago",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight gradient-text">Project Templates</h2>
            <p className="text-muted-foreground">Select a template to get started with your new project</p>
          </div>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search templates..." className="w-full pl-8" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden card-hover border-glow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="px-2 py-1 font-normal">
                    {template.category}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {template.lastUpdated}
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  {template.icon}
                  <div>
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <CardDescription className="mt-1">{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span>Popularity: {template.popularity}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-muted/10 px-6 py-3">
                <Button variant="ghost" size="sm">Preview</Button>
                <Button size="sm">Use Template</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
} 
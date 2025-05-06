import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, AlertTriangle, Brain, BookOpen, Code, X } from "lucide-react"

interface StatusCardProps {
  title: string
  status: "operational" | "degraded" | "outage" | "active"
  description: string
  icon: "check" | "alert" | "brain" | "book" | "code" | "x"
}

export function StatusCard({ title, status, description, icon }: StatusCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "operational":
        return "text-green-500"
      case "degraded":
        return "text-yellow-500"
      case "outage":
        return "text-red-500"
      case "active":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "operational":
        return "Operational"
      case "degraded":
        return "Degraded"
      case "outage":
        return "Outage"
      case "active":
        return "Active"
      default:
        return "Unknown"
    }
  }

  const getIcon = () => {
    switch (icon) {
      case "check":
        return <Check className="h-5 w-5" />
      case "alert":
        return <AlertTriangle className="h-5 w-5" />
      case "brain":
        return <Brain className="h-5 w-5" />
      case "book":
        return <BookOpen className="h-5 w-5" />
      case "code":
        return <Code className="h-5 w-5" />
      case "x":
        return <X className="h-5 w-5" />
      default:
        return <Check className="h-5 w-5" />
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`${getStatusColor()}`}>{getIcon()}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{getStatusText()}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MilestoneTable() {
  const milestones = [
    {
      section: "Bootstrap & Setup",
      milestone: "Workspace Bootstrap",
      status: "done",
      startDate: "2023-11-01",
      endDate: "2023-11-10",
    },
    {
      section: "Bootstrap & Setup",
      milestone: "DevContainer Integration",
      status: "done",
      startDate: "2023-11-05",
      endDate: "2023-11-15",
    },
    {
      section: "Bootstrap & Setup",
      milestone: "Automated Diagnostics",
      status: "done",
      startDate: "2023-11-10",
      endDate: "2023-11-20",
    },
    {
      section: "Core Foundations",
      milestone: "Knowledge Foundations",
      status: "done",
      startDate: "2023-11-15",
      endDate: "2023-12-01",
    },
    {
      section: "Core Foundations",
      milestone: "AutoRound Quantization",
      status: "done",
      startDate: "2023-12-01",
      endDate: "2023-12-15",
    },
    {
      section: "Core Foundations",
      milestone: "Model Context Protocol",
      status: "done",
      startDate: "2023-12-10",
      endDate: "2023-12-20",
    },
    {
      section: "Applications & Utilities",
      milestone: "Simulation Manager",
      status: "done",
      startDate: "2023-12-20",
      endDate: "2024-01-10",
    },
    {
      section: "Applications & Utilities",
      milestone: "Oracle CLI",
      status: "done",
      startDate: "2024-01-05",
      endDate: "2024-01-20",
    },
    {
      section: "Applications & Utilities",
      milestone: "Meteor Markdown Editor",
      status: "active",
      startDate: "2024-01-15",
      endDate: "2024-05-01",
    },
    {
      section: "Applications & Utilities",
      milestone: "Temporal Calendar",
      status: "done",
      startDate: "2024-02-01",
      endDate: "2024-02-20",
    },
    {
      section: "Expansion & Community",
      milestone: "Cookbooks & Samples",
      status: "done",
      startDate: "2024-02-10",
      endDate: "2024-03-01",
    },
    {
      section: "Expansion & Community",
      milestone: "Community Contributions",
      status: "active",
      startDate: "2024-03-01",
      endDate: "2025-05-01",
    },
    {
      section: "Next & Future",
      milestone: "LLM Fine-tuning Pipelines",
      status: "planned",
      startDate: "2024-05-10",
      endDate: "2024-06-01",
    },
    {
      section: "Next & Future",
      milestone: "Distributed Agent Systems",
      status: "planned",
      startDate: "2024-06-01",
      endDate: "2024-07-01",
    },
    {
      section: "Next & Future",
      milestone: "Research & Philosophy Docs",
      status: "planned",
      startDate: "2024-06-15",
      endDate: "2024-07-15",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return <Badge className="bg-green-500">Done</Badge>
      case "active":
        return <Badge className="bg-blue-500">Active</Badge>
      case "planned":
        return <Badge className="bg-gray-500">Planned</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Milestones</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Section</TableHead>
              <TableHead>Milestone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {milestones.map((milestone, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{milestone.section}</TableCell>
                <TableCell>{milestone.milestone}</TableCell>
                <TableCell>{getStatusBadge(milestone.status)}</TableCell>
                <TableCell>{milestone.startDate}</TableCell>
                <TableCell>{milestone.endDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

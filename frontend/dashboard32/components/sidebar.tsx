"use client"

import { cn } from "@/lib/utils"
import {
  Activity,
  Blocks,
  BookOpen,
  Brain,
  Calendar,
  Code,
  Database,
  FileCode,
  FileText,
  Home,
  LayoutDashboard,
  Settings,
  Terminal,
  Wrench,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      title: "Dashboard",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Projects",
      href: "/projects",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "AI Ecosystems",
      href: "/ai-ecosystems",
      icon: <Brain className="h-5 w-5" />,
      children: [
        {
          title: "Models",
          href: "/ai-ecosystems/models",
          icon: <Blocks className="h-4 w-4" />,
        },
        {
          title: "AutoRound",
          href: "/ai-ecosystems/auto-round",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          title: "MCP",
          href: "/ai-ecosystems/mcp",
          icon: <Terminal className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Knowledge Foundations",
      href: "/knowledge",
      icon: <BookOpen className="h-5 w-5" />,
      children: [
        {
          title: "Datasets",
          href: "/knowledge/datasets",
          icon: <Database className="h-4 w-4" />,
        },
        {
          title: "Library",
          href: "/knowledge/library",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Blockchain",
      href: "/blockchain",
      icon: <Code className="h-5 w-5" />,
      children: [
        {
          title: "Hardhat",
          href: "/blockchain/hardhat",
          icon: <Wrench className="h-4 w-4" />,
        },
        {
          title: "Smart Contracts",
          href: "/blockchain/contracts",
          icon: <FileCode className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Applications",
      href: "/applications",
      icon: <Terminal className="h-5 w-5" />,
      children: [
        {
          title: "Meteor Editor",
          href: "/applications/meteor",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Oracle CLI",
          href: "/applications/oracle",
          icon: <Terminal className="h-4 w-4" />,
        },
        {
          title: "Temporal Calendar",
          href: "/applications/calendar",
          icon: <Calendar className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Blocks className="h-6 w-6" />
          <span className="text-lg font-bold">Artifact Virtual</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route, i) => (
            <div key={i}>
              <Link
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === route.href ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                {route.icon}
                {route.title}
              </Link>
              {route.children && (
                <div className="ml-4 mt-1 grid gap-1">
                  {route.children.map((child, j) => (
                    <Link
                      key={j}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        pathname === child.href ? "bg-accent text-accent-foreground" : "transparent",
                      )}
                    >
                      {child.icon}
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-secondary p-3 text-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">System Status</p>
            <p className="text-xs text-muted-foreground">Operational</p>
          </div>
        </div>
      </div>
    </div>
  )
}

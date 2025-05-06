"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Activity,
  Atom,
  BookOpen,
  Box,
  Brain,
  Braces,
  Calendar,
  ChevronDown,
  Code,
  CodeSquare,
  Cpu,
  Database,
  FileCode,
  FileText,
  FolderKanban,
  GitBranch,
  Globe,
  HardDrive,
  Home,
  LayoutDashboard,
  type LucideIcon,
  Network,
  PlaySquare,
  Search,
  Server,
  Settings,
  Terminal,
  User,
  Wallet,
  Wrench,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

interface NavigationGroup {
  title: string
  items: NavigationItem[]
}

interface NavigationItem {
  title: string
  href: string
  icon: LucideIcon
  isActive?: boolean
  badge?: string | number
  children?: {
    title: string
    href: string
    icon: LucideIcon
    isActive?: boolean
    badge?: string | number
  }[]
}

export function SidebarNavigation() {
  const pathname = usePathname()

  // Navigation data with comprehensive structure
  const navigationGroups: NavigationGroup[] = [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/",
          icon: Home,
          isActive: pathname === "/",
        },
      ],
    },
    {
      title: "Content Management",
      items: [
        {
          title: "Projects",
          href: "/projects",
          icon: LayoutDashboard,
          isActive: pathname?.startsWith("/projects"),
          badge: "New",
          children: [
            {
              title: "All Projects",
              href: "/projects",
              icon: FolderKanban,
              isActive: pathname === "/projects",
            },
            {
              title: "Create New",
              href: "/projects/create",
              icon: Box,
              isActive: pathname === "/projects/create",
            },
            {
              title: "Templates",
              href: "/projects/templates",
              icon: CodeSquare,
              isActive: pathname === "/projects/templates",
            },
          ],
        },
        {
          title: "Applications",
          href: "/applications",
          icon: Terminal,
          isActive: pathname?.startsWith("/applications"),
          children: [
            {
              title: "Meteor Editor",
              href: "/applications/meteor",
              icon: FileText,
              isActive: pathname === "/applications/meteor",
            },
            {
              title: "Oracle CLI",
              href: "/applications/oracle",
              icon: Terminal,
              isActive: pathname === "/applications/oracle",
            },
            {
              title: "Temporal Calendar",
              href: "/applications/calendar",
              icon: Calendar,
              isActive: pathname === "/applications/calendar",
            },
          ],
        },
        {
          title: "Research",
          href: "/research",
          icon: Brain,
          isActive: pathname?.startsWith("/research"),
          badge: 3,
        },
      ],
    },
    {
      title: "AI & Knowledge",
      items: [
        {
          title: "AI Ecosystems",
          href: "/ai-ecosystems",
          icon: Brain,
          isActive: pathname?.startsWith("/ai-ecosystems"),
          children: [
            {
              title: "Models",
              href: "/ai-ecosystems/models",
              icon: Braces,
              isActive: pathname === "/ai-ecosystems/models",
            },
            {
              title: "Model Quantization",
              href: "/ai-ecosystems/quantization",
              icon: Activity,
              isActive: pathname === "/ai-ecosystems/quantization",
            },
            {
              title: "Communication Protocols",
              href: "/ai-ecosystems/protocols",
              icon: Network,
              isActive: pathname === "/ai-ecosystems/protocols",
            },
            {
              title: "AI Lab",
              href: "/ai-ecosystems/lab",
              icon: PlaySquare,
              isActive: pathname === "/ai-ecosystems/lab",
              badge: "New",
            },
          ],
        },
        {
          title: "Knowledge Foundations",
          href: "/knowledge",
          icon: BookOpen,
          isActive: pathname?.startsWith("/knowledge"),
          children: [
            {
              title: "Datasets",
              href: "/knowledge/datasets",
              icon: Database,
              isActive: pathname === "/knowledge/datasets",
            },
            {
              title: "Library",
              href: "/knowledge/library",
              icon: FileText,
              isActive: pathname === "/knowledge/library",
            },
            {
              title: "Document Uploader",
              href: "/knowledge/uploader",
              icon: HardDrive,
              isActive: pathname === "/knowledge/uploader",
            },
          ],
        },
        {
          title: "Server Management",
          href: "/servers",
          icon: Server,
          isActive: pathname?.startsWith("/servers"),
          badge: "New",
          children: [
            {
              title: "Data Servers",
              href: "/servers/data",
              icon: Database,
              isActive: pathname === "/servers/data",
            },
            {
              title: "Sensory Servers",
              href: "/servers/sensory",
              icon: Activity,
              isActive: pathname === "/servers/sensory",
            },
            {
              title: "MCP Servers",
              href: "/servers/mcp",
              icon: Cpu,
              isActive: pathname === "/servers/mcp",
            },
          ],
        },
      ],
    },
    {
      title: "Technology",
      items: [
        {
          title: "Blockchain Development",
          href: "/blockchain",
          icon: Code,
          isActive: pathname?.startsWith("/blockchain"),
          children: [
            {
              title: "Wallets",
              href: "/blockchain/wallets",
              icon: Wallet,
              isActive: pathname === "/blockchain/wallets",
            },
            {
              title: "Networks",
              href: "/blockchain/networks",
              icon: Globe,
              isActive: pathname === "/blockchain/networks",
            },
            {
              title: "Smart Contracts",
              href: "/blockchain/contracts",
              icon: FileCode,
              isActive: pathname === "/blockchain/contracts",
            },
            {
              title: "IDE",
              href: "/blockchain/ide",
              icon: CodeSquare,
              isActive: pathname === "/blockchain/ide",
              badge: "New",
            },
            {
              title: "Tasks",
              href: "/blockchain/tasks",
              icon: GitBranch,
              isActive: pathname === "/blockchain/tasks",
            },
          ],
        },
        {
          title: "System Management",
          href: "/system",
          icon: Cpu,
          isActive: pathname?.startsWith("/system"),
          badge: "New",
          children: [
            {
              title: "Memory & Storage",
              href: "/system/storage",
              icon: HardDrive,
              isActive: pathname === "/system/storage",
            },
            {
              title: "GPU Management",
              href: "/system/gpu",
              icon: Cpu,
              isActive: pathname === "/system/gpu",
            },
            {
              title: "System Cooling",
              href: "/system/cooling",
              icon: Wrench,
              isActive: pathname === "/system/cooling",
            },
          ],
        },
        {
          title: "Quantum Computing",
          href: "/quantum",
          icon: Atom,
          isActive: pathname?.startsWith("/quantum"),
          badge: "New",
        },
      ],
    },
  ]

  return (
    <Sidebar collapsible="icon" variant="floating" className="border-r">
      <SidebarHeader>
        <div className="flex h-14 items-center px-4 py-2">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo />
          </Link>
        </div>
        <SidebarSeparator />
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <SidebarInput type="search" placeholder="Search..." className="pl-8" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar">
        {navigationGroups.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item, itemIndex) => (
                  <SidebarMenuItem key={itemIndex}>
                    {item.children && item.children.length > 0 ? (
                      <>
                        <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
                          <button className="group w-full" data-state={item.isActive ? "open" : "closed"}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                          </button>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          {item.children.map((child, childIndex) => (
                            <SidebarMenuSubItem key={childIndex}>
                              <SidebarMenuSubButton asChild isActive={child.isActive}>
                                <Link href={child.href}>
                                  <child.icon className="h-3 w-3" />
                                  <span>{child.title}</span>
                                  {child.badge && (
                                    <Badge
                                      variant="outline"
                                      className="ml-auto text-xs h-5 min-w-5 flex items-center justify-center"
                                    >
                                      {child.badge}
                                    </Badge>
                                  )}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </>
                    ) : (
                      <>
                        <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                          </Link>
                        </SidebarMenuButton>
                      </>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>
        <SidebarSeparator />
        <div className="p-4">
          <div className="flex items-center gap-3 rounded-lg bg-card p-3 text-sm">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback>AV</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@artifactvirtual.com</p>
            </div>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

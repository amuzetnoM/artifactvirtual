"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  ChevronRight,
  Home,
  Cpu,
  Database,
  Layers,
  Code,
  Braces,
  Server,
  Microscope,
  Atom,
  Wallet,
  Settings,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type SidebarItem = {
  title: string
  icon: React.ElementType
  href?: string
  children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    title: "AI Ecosystems",
    icon: Braces,
    children: [
      {
        title: "Overview",
        icon: ChevronRight,
        href: "/ai-ecosystems",
      },
      {
        title: "AI Lab",
        icon: ChevronRight,
        href: "/ai-ecosystems/lab",
      },
    ],
  },
  {
    title: "Blockchain",
    icon: Layers,
    children: [
      {
        title: "Overview",
        icon: ChevronRight,
        href: "/blockchain",
      },
      {
        title: "Wallets",
        icon: Wallet,
        href: "/blockchain/wallets",
      },
    ],
  },
  {
    title: "Knowledge Systems",
    icon: Database,
    href: "/knowledge",
  },
  {
    title: "Applications",
    icon: Code,
    href: "/applications",
  },
  {
    title: "Projects",
    icon: Layers,
    href: "/projects",
  },
  {
    title: "Research",
    icon: Microscope,
    href: "/research",
  },
  {
    title: "System",
    icon: Cpu,
    href: "/system",
  },
  {
    title: "Servers",
    icon: Server,
    href: "/servers",
  },
  {
    title: "Quantum Computing",
    icon: Atom,
    href: "/quantum",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

type SidebarLinkProps = {
  item: SidebarItem
  isNested?: boolean
  isOpen?: boolean
  toggleOpen?: () => void
}

const SidebarLink = ({ item, isNested = false, isOpen, toggleOpen }: SidebarLinkProps) => {
  const [isChildrenOpen, setIsChildrenOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  const handleClick = () => {
    if (hasChildren) {
      setIsChildrenOpen(!isChildrenOpen)
    }
  }

  return (
    <div className={cn("text-sidebar-foreground", isNested && "ml-4")}>
      {item.href ? (
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
            isNested && "text-sm",
          )}
          onClick={hasChildren ? handleClick : undefined}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
          {hasChildren && (
            <ChevronDown
              className={cn("h-4 w-4 ml-auto transition-transform", isChildrenOpen && "transform rotate-180")}
            />
          )}
        </Link>
      ) : (
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
            isNested && "text-sm",
          )}
          onClick={handleClick}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
          <ChevronDown
            className={cn("h-4 w-4 ml-auto transition-transform", isChildrenOpen && "transform rotate-180")}
          />
        </button>
      )}

      {hasChildren && isChildrenOpen && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child, index) => (
            <SidebarLink key={`child-${item.title}-${index}`} item={child} isNested={true} />
          ))}
        </div>
      )}
    </div>
  )
}

export function UnifiedSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="text-xl font-bold text-sidebar-foreground">Artifact Virtual</h2>
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto custom-scrollbar h-[calc(100vh-64px)]">
          {sidebarItems.map((item, index) => (
            <SidebarLink key={`sidebar-${item.title}-${index}`} item={item} />
          ))}
        </nav>
      </div>
    </>
  )
}

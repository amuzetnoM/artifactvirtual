"use client"

import type React from "react"
import { SidebarNavigation } from "@/components/navigation/sidebar"
import { Header } from "@/components/header"
import { AvaAssistant } from "@/components/ava-assistant"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen overflow-hidden">
        <SidebarNavigation />
        <SidebarInset className="flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-secondary/10">{children}</main>
        </SidebarInset>
        <AvaAssistant />
      </div>
    </SidebarProvider>
  )
}

import type React from "react"
import { UnifiedSidebar } from "@/components/unified-sidebar"

export function UnifiedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <UnifiedSidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8">{children}</main>
    </div>
  )
}

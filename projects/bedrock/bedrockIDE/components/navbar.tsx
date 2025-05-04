import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Code2, Layers } from 'lucide-react'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Layers className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-block">Blockchain Development Platform</span>
          <span className="sm:hidden">BDP</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/code-editor" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            <Code2 className="h-4 w-4" />
            Code Editor
          </Link>
          <Link href="/blockchain" className="text-sm font-medium hover:text-primary transition-colors">
            Blockchain Tools
          </Link>
          <Link href="/docs" className="text-sm font-medium hover:text-primary transition-colors">
            Documentation
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm" className="hidden md:flex">
            <Link href="https://github.com/blockchain-platform/docs" target="_blank">
              GitHub
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

import Link from "next/link"
import { Layers } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-8">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Layers className="h-6 w-6 text-primary" />
            <span>BDP</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            A comprehensive platform for blockchain development with AI assistance.
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/code-editor" className="text-muted-foreground hover:text-foreground transition-colors">
                Code Editor
              </Link>
            </li>
            <li>
              <Link href="/blockchain" className="text-muted-foreground hover:text-foreground transition-colors">
                Blockchain Tools
              </Link>
            </li>
            <li>
              <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/docs/guides" className="text-muted-foreground hover:text-foreground transition-colors">
                Guides
              </Link>
            </li>
            <li>
              <Link href="/docs/tutorials" className="text-muted-foreground hover:text-foreground transition-colors">
                Tutorials
              </Link>
            </li>
            <li>
              <Link href="/docs/api" className="text-muted-foreground hover:text-foreground transition-colors">
                API Reference
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mt-8 border-t pt-8">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Blockchain Development Platform. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

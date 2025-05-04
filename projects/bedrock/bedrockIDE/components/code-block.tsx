"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CodeBlockProps {
  code: string
  language: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "Code has been copied to your clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy code to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="relative rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted">
        <span className="text-xs font-medium">{language}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto bg-muted/50 text-sm font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
}

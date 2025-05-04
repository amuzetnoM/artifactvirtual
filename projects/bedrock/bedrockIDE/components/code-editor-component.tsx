"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

// This is a placeholder for a real code editor component
// In a real implementation, you would use a library like Monaco Editor or CodeMirror
export function CodeEditorComponent({ value, onChange, language }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading the editor
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full p-4 font-mono text-sm bg-background resize-none focus:outline-none"
        spellCheck="false"
      />
    </div>
  )
}

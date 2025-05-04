"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send } from "lucide-react"

interface AIAssistantProps {
  prompt: string
  setPrompt: (prompt: string) => void
  response: string
  isLoading: boolean
  onSubmit: () => void
}

export function AIAssistant({ prompt, setPrompt, response, isLoading, onSubmit }: AIAssistantProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <ScrollArea className="flex-1 p-4">
        {response ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap">{response}</pre>
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-sm p-4">
            Ask the AI assistant for help with your code. Try questions like:
            <ul className="text-left list-disc pl-6 mt-2 space-y-1">
              <li>Explain how this contract works</li>
              <li>Find security vulnerabilities in my code</li>
              <li>Optimize this function for gas efficiency</li>
              <li>Convert this Solidity code to Vyper</li>
            </ul>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask the AI assistant..."
            className="min-h-[80px] resize-none"
            onKeyDown={handleKeyDown}
          />
          <Button className="self-end" onClick={onSubmit} disabled={isLoading || !prompt.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press <kbd className="px-1 py-0.5 bg-muted rounded-sm">Ctrl</kbd> +{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded-sm">Enter</kbd> to submit
        </p>
      </div>
    </div>
  )
}

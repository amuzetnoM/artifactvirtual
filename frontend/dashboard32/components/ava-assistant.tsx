"use client"

import type * as React from "react"
import { useState } from "react"
import { Bot, Maximize2, Minimize2, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface AvaAssistantProps {
  className?: string
}

type Message = {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

export function AvaAssistant({ className }: AvaAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm AVA, Artifact Virtual's Assistant. How can I help you?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])

  const toggleOpen = () => setIsOpen(!isOpen)
  const toggleExpand = () => setIsExpanded(!isExpanded)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (input.trim()) {
      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: input,
        sender: "user",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")

      // Simulate assistant response (in a real app, you'd call your LLM API here)
      setTimeout(() => {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          content:
            "I'm AVA, your virtual assistant. I can help you navigate the Artifact Virtual platform, manage your projects, and answer questions about AI, blockchain, and quantum computing.",
          sender: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }, 1000)
    }
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 animate-pulse-glow"
          onClick={toggleOpen}
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div
          className={cn(
            "flex flex-col bg-background rounded-lg border shadow-lg card-hover",
            isExpanded ? "fixed bottom-4 right-4 top-4 left-4 md:left-auto md:w-[600px]" : "w-[350px] h-[500px]",
          )}
        >
          <Card className="flex flex-col h-full border-0 rounded-lg">
            <CardHeader className="border-b px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg gradient-text">AVA</CardTitle>
                    <CardDescription className="text-xs">Artifact Virtual Assistant</CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleExpand}>
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    <span className="sr-only">{isExpanded ? "Minimize" : "Maximize"}</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleOpen}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                      message.sender === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <CardFooter className="border-t p-3">
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <Input
                  placeholder="Ask AVA anything about your files..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1"
                  autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

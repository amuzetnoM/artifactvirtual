"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Bot, Maximize2, Minimize2, MoreVertical, Send, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface ChatMessage {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  timestamp: Date
}

interface ChatPanelProps {
  id: string
  title: string
  icon?: React.ReactNode
  messages?: ChatMessage[]
  onSend?: (message: string) => void
  onClose?: () => void
  className?: string
  modelInfo?: {
    name: string
    provider: string
    avatar?: string
  }
}

export function ChatPanel({
  id,
  title,
  icon = <Bot className="h-4 w-4" />,
  messages = [],
  onSend,
  onClose,
  className,
  modelInfo,
}: ChatPanelProps) {
  const [input, setInput] = React.useState("")
  const [isExpanded, setIsExpanded] = React.useState(false)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() && onSend) {
      onSend(input.trim())
      setInput("")
    }
  }

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden transition-all duration-200 card-hover",
        isExpanded ? "fixed inset-4 z-50" : "h-[500px] w-[350px]",
        className,
      )}
    >
      <CardHeader className="border-b px-4 py-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">{icon}</div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="sr-only">{isExpanded ? "Minimize" : "Maximize"}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Clear chat</DropdownMenuItem>
              <DropdownMenuItem>Export chat</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </CardHeader>

      {modelInfo && (
        <div className="bg-muted/30 px-4 py-2 text-xs flex items-center gap-2 border-b">
          <Avatar className="h-5 w-5">
            <AvatarImage src={modelInfo.avatar || "/placeholder.svg"} alt={modelInfo.name} />
            <AvatarFallback>{modelInfo.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{modelInfo.name}</span>
          <span className="text-muted-foreground">by {modelInfo.provider}</span>
        </div>
      )}

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center p-8">
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-3">{icon}</div>
                </div>
                <h3 className="text-lg font-semibold">Start a conversation</h3>
                <p className="text-sm text-muted-foreground">Send a message to start chatting with the AI assistant.</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : message.role === "assistant"
                      ? "bg-muted"
                      : "bg-muted/50 text-muted-foreground italic text-xs w-full max-w-full",
                )}
              >
                {message.content}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <CardFooter className="border-t p-3">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="Type your message..."
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
  )
}

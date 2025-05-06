"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatPanel, type ChatMessage } from "@/components/ui/chat-panel"
import { Brain, Plus, Settings, Workflow } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ModelConfig {
  id: string
  name: string
  provider: string
  avatar?: string
}

interface ChatInstance {
  id: string
  model: ModelConfig
  messages: ChatMessage[]
}

const availableModels: ModelConfig[] = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "llama-3", name: "Llama 3", provider: "Meta", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "mistral-large", name: "Mistral Large", provider: "Mistral AI", avatar: "/placeholder.svg?height=40&width=40" },
]

export function AILabDashboard() {
  const [chatInstances, setChatInstances] = React.useState<ChatInstance[]>([])
  const [selectedModel, setSelectedModel] = React.useState<string>(availableModels[0].id)

  const addChatInstance = () => {
    const model = availableModels.find((m) => m.id === selectedModel) || availableModels[0]
    const newInstance: ChatInstance = {
      id: uuidv4(),
      model,
      messages: [
        {
          id: uuidv4(),
          role: "system",
          content: "This is an AI assistant. Ask me anything!",
          timestamp: new Date(),
        },
      ],
    }
    setChatInstances([...chatInstances, newInstance])
  }

  const removeChatInstance = (id: string) => {
    setChatInstances(chatInstances.filter((instance) => instance.id !== id))
  }

  const handleSendMessage = (instanceId: string, message: string) => {
    setChatInstances((prevInstances) => {
      return prevInstances.map((instance) => {
        if (instance.id === instanceId) {
          // Add user message
          const userMessage: ChatMessage = {
            id: uuidv4(),
            role: "user",
            content: message,
            timestamp: new Date(),
          }

          // Simulate AI response (in a real app, you'd call your API here)
          const aiMessage: ChatMessage = {
            id: uuidv4(),
            role: "assistant",
            content: `This is a simulated response from ${instance.model.name} by ${instance.model.provider}. In a real implementation, this would be replaced with an actual API call to the model provider.`,
            timestamp: new Date(),
          }

          return {
            ...instance,
            messages: [...instance.messages, userMessage, aiMessage],
          }
        }
        return instance
      })
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-text"></h2>
          <p className="text-muted-foreground"></p>
        </div>
        <Button className="gap-2">
          <Settings className="h-4 w-4" /> Configure
        </Button>
      </div>

      <Tabs defaultValue="playground" className="space-y-4">
        <TabsList>
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="playground" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Playground</CardTitle>
              <CardDescription>
                Add multiple chat instances to compare different models or create complex workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addChatInstance} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Chat
                  </Button>
                </div>
              </div>

              {chatInstances.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No chat instances</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Add a chat instance to start experimenting with AI models. You can add multiple instances to compare
                    different models.
                  </p>
                  <Button onClick={addChatInstance} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Your First Chat
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chatInstances.map((instance) => (
                    <ChatPanel
                      key={instance.id}
                      id={instance.id}
                      title={instance.model.name}
                      icon={<Brain className="h-4 w-4 text-primary" />}
                      messages={instance.messages}
                      onSend={(message) => handleSendMessage(instance.id, message)}
                      onClose={() => removeChatInstance(instance.id)}
                      modelInfo={{
                        name: instance.model.name,
                        provider: instance.model.provider,
                        avatar: instance.model.avatar,
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Workflows</CardTitle>
              <CardDescription>Create and manage complex AI workflows by chaining models and tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Workflow className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Create Your First Workflow</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Chain multiple models and tasks together to create powerful AI workflows for complex tasks.
                </p>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Create Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
              <CardDescription>View and manage your past conversations with AI models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-4 text-center text-muted-foreground">
                  No conversation history yet. Start chatting with AI models to see your history here.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

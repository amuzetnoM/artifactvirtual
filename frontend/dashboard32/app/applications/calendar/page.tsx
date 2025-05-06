import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, Plus, ChevronLeft, ChevronRight, Users } from "lucide-react"

export default function TemporalCalendarPage() {
  // Define the current month
  const date = new Date()
  const month = date.toLocaleString('default', { month: 'long' })
  const year = date.getFullYear()
  
  // Sample events data
  const events = [
    {
      id: "1",
      title: "AI Model Training",
      description: "Start training the new transformer model",
      date: "2024-05-12",
      time: "09:00 - 17:00",
      category: "AI",
      attendees: ["John Doe", "Jane Smith", "AI System"]
    },
    {
      id: "2",
      title: "Blockchain Review",
      description: "Code review for smart contract implementation",
      date: "2024-05-15",
      time: "13:00 - 15:00",
      category: "Blockchain",
      attendees: ["Alice Johnson", "Bob Chen"]
    },
    {
      id: "3",
      title: "Project Planning",
      description: "Q3 project planning session",
      date: "2024-05-18",
      time: "10:00 - 12:00",
      category: "Planning",
      attendees: ["Team Leads", "Product Managers"]
    },
    {
      id: "4",
      title: "Quantum Algorithm Demo",
      description: "Demonstration of new quantum computing algorithms",
      date: "2024-05-22",
      time: "14:00 - 16:00",
      category: "Quantum",
      attendees: ["Research Team", "Stakeholders"]
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight gradient-text">Temporal Calendar</h2>
            <p className="text-muted-foreground">Project timeline and scheduling system</p>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Event
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CalendarClock className="h-5 w-5" />
                    {month} {year}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar mode="single" className="rounded-md border" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Your scheduled events for this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex flex-col space-y-2 border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{event.title}</div>
                        <Badge variant="outline" className={
                          event.category === "AI" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : 
                          event.category === "Blockchain" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
                          event.category === "Quantum" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" :
                          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }>
                          {event.category}
                        </Badge>
                      </div>
                      <div className="text-sm">{event.date}, {event.time}</div>
                      <div className="text-sm text-muted-foreground">{event.description}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="mr-1 h-3 w-3" />
                        {event.attendees.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Tabs defaultValue="daily" className="space-y-4">
              <TabsList className="w-full">
                <TabsTrigger value="daily" className="flex-1">Daily</TabsTrigger>
                <TabsTrigger value="weekly" className="flex-1">Weekly</TabsTrigger>
                <TabsTrigger value="monthly" className="flex-1">Monthly</TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Schedule</CardTitle>
                    <CardDescription>
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-center text-muted-foreground py-8">
                        No events scheduled for today
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="weekly" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>This Week</CardTitle>
                    <CardDescription>May 8 - May 14, 2024</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2 border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">AI Model Training</div>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            AI
                          </Badge>
                        </div>
                        <div className="text-sm">2024-05-12, 09:00 - 17:00</div>
                        <div className="text-sm text-muted-foreground">Start training the new transformer model</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="monthly" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Overview</CardTitle>
                    <CardDescription>May 2024</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Events:</span>
                        <span>4</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>AI Related:</span>
                        <span>1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Blockchain Related:</span>
                        <span>1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Quantum Related:</span>
                        <span>1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Planning Sessions:</span>
                        <span>1</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 
"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Atom, Code, Play, Plus, Settings } from "lucide-react"

export function QuantumComputingDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-text"></h2>
          <p className="text-muted-foreground"></p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Quantum Circuit
        </Button>
      </div>

      <Tabs defaultValue="circuits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="circuits">Quantum Circuits</TabsTrigger>
          <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="circuits" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="overflow-hidden card-hover border-glow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Bell State Generator</CardTitle>
                  <Badge>Basic</Badge>
                </div>
                <CardDescription>Creates a quantum entanglement between two qubits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                  <Atom className="h-12 w-12 text-primary animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1">
                    <Play className="h-4 w-4" /> Run
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Code className="h-4 w-4" /> Edit
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden card-hover border-glow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Quantum Fourier Transform</CardTitle>
                  <Badge>Advanced</Badge>
                </div>
                <CardDescription>Implements QFT for quantum signal processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                  <Atom className="h-12 w-12 text-primary animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1">
                    <Play className="h-4 w-4" /> Run
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Code className="h-4 w-4" /> Edit
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden card-hover border-glow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Grover's Algorithm</CardTitle>
                  <Badge>Advanced</Badge>
                </div>
                <CardDescription>Quantum search algorithm for unstructured databases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                  <Atom className="h-12 w-12 text-primary animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1">
                    <Play className="h-4 w-4" /> Run
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Code className="h-4 w-4" /> Edit
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-accent/50 border-glow">
              <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="font-medium">Create New Circuit</p>
              <p className="text-sm text-muted-foreground">Design a new quantum circuit</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="algorithms" className="space-y-4">
          <Card className="border-glow">
            <CardHeader>
              <CardTitle>Quantum Algorithms</CardTitle>
              <CardDescription>Explore and implement quantum algorithms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-4">
                  <h3 className="text-lg font-medium">Available Algorithms</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Atom className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Shor's Algorithm</p>
                          <p className="text-sm text-muted-foreground">Integer factorization</p>
                        </div>
                      </div>
                      <Button size="sm">Implement</Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Atom className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Quantum Phase Estimation</p>
                          <p className="text-sm text-muted-foreground">Eigenvalue estimation</p>
                        </div>
                      </div>
                      <Button size="sm">Implement</Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Atom className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">VQE</p>
                          <p className="text-sm text-muted-foreground">Variational Quantum Eigensolver</p>
                        </div>
                      </div>
                      <Button size="sm">Implement</Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Atom className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">QAOA</p>
                          <p className="text-sm text-muted-foreground">Quantum Approximate Optimization Algorithm</p>
                        </div>
                      </div>
                      <Button size="sm">Implement</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulation" className="space-y-4">
          <Card className="border-glow">
            <CardHeader>
              <CardTitle>Quantum Simulation</CardTitle>
              <CardDescription>Run quantum simulations on classical hardware</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <h3 className="text-lg font-medium">Simulation Settings</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Number of Qubits</label>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                        <option>2 qubits</option>
                        <option>4 qubits</option>
                        <option>8 qubits</option>
                        <option>16 qubits</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Simulation Method</label>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                        <option>State Vector</option>
                        <option>Density Matrix</option>
                        <option>Matrix Product State</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Noise Model</label>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                        <option>None (Ideal)</option>
                        <option>Depolarizing</option>
                        <option>Amplitude Damping</option>
                        <option>Custom</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Shots</label>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                        <option>1,000</option>
                        <option>10,000</option>
                        <option>100,000</option>
                        <option>Custom</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button className="gap-2">
                      <Play className="h-4 w-4" /> Run Simulation
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Settings className="h-4 w-4" /> Advanced Settings
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <h3 className="text-lg font-medium">Simulation Results</h3>
                  <div className="mt-4 flex items-center justify-center p-8 text-center">
                    <div>
                      <Atom className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        No simulation results yet. Run a simulation to see results here.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

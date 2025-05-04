"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Check, AlertCircle, RefreshCw, ExternalLink } from "lucide-react"
import { callContractFunction, getContractFunctions, sendContractTransaction } from "@/lib/blockchain-utils"

interface ContractInteractionProps {
  network: string
}

export function ContractInteraction({ network }: ContractInteractionProps) {
  const [contractAddress, setContractAddress] = useState("")
  const [contractABI, setContractABI] = useState("")
  const [contractFunctions, setContractFunctions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [functionInputs, setFunctionInputs] = useState<Record<string, string[]>>({})

  const handleLoadContract = async () => {
    if (!contractAddress || !contractABI) {
      setResult({
        success: false,
        message: "Please enter both contract address and ABI",
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Parse ABI and extract functions
      const functions = await getContractFunctions(contractABI)
      setContractFunctions(functions)

      // Initialize function inputs
      const inputs: Record<string, string[]> = {}
      functions.forEach((func) => {
        inputs[func.name] = Array(func.inputs?.length || 0).fill("")
      })
      setFunctionInputs(inputs)

      setResult({
        success: true,
        message: `Contract loaded successfully with ${functions.length} functions`,
      })
    } catch (error) {
      setResult({
        success: false,
        message: `Failed to load contract: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFunctionCall = async (functionName: string, stateMutability: string) => {
    setLoading(true)
    setResult(null)

    try {
      const args = functionInputs[functionName] || []

      if (stateMutability === "view" || stateMutability === "pure") {
        // Call (read-only function)
        const response = await callContractFunction(contractAddress, contractABI, functionName, args, network)
        setResult({
          success: true,
          message: `Result: ${response}`,
        })
      } else {
        // Send transaction (state-changing function)
        const txHash = await sendContractTransaction(contractAddress, contractABI, functionName, args, network)
        setResult({
          success: true,
          message: `Transaction sent: ${txHash}`,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (functionName: string, index: number, value: string) => {
    setFunctionInputs((prev) => {
      const newInputs = { ...prev }
      if (!newInputs[functionName]) {
        newInputs[functionName] = []
      }
      newInputs[functionName][index] = value
      return newInputs
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Interaction</CardTitle>
        <CardDescription>Interact with deployed smart contracts</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connect">
          <TabsList className="mb-4">
            <TabsTrigger value="connect">Connect</TabsTrigger>
            <TabsTrigger value="read" disabled={contractFunctions.length === 0}>
              Read
            </TabsTrigger>
            <TabsTrigger value="write" disabled={contractFunctions.length === 0}>
              Write
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contract-address">Contract Address</Label>
              <Input
                id="contract-address"
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract-abi">Contract ABI</Label>
              <Textarea
                id="contract-abi"
                placeholder="Paste your contract ABI here"
                value={contractABI}
                onChange={(e) => setContractABI(e.target.value)}
                className="font-mono text-sm h-32"
              />
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="read">
            <Accordion type="single" collapsible className="w-full">
              {contractFunctions
                .filter((func) => func.stateMutability === "view" || func.stateMutability === "pure")
                .map((func, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-sm">
                      {func.name}
                      {func.inputs?.length > 0 && `(${func.inputs.map((input) => input.type).join(", ")})`}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-2">
                        {func.inputs?.length > 0 && (
                          <div className="space-y-2">
                            {func.inputs.map((input, inputIndex) => (
                              <div key={inputIndex} className="grid grid-cols-4 gap-2 items-center">
                                <Label className="text-xs">{input.name || `param${inputIndex}`}</Label>
                                <Input
                                  className="col-span-3"
                                  placeholder={input.type}
                                  value={functionInputs[func.name]?.[inputIndex] || ""}
                                  onChange={(e) => handleInputChange(func.name, inputIndex, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleFunctionCall(func.name, func.stateMutability)}
                          disabled={loading}
                        >
                          {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                          Call
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
            {contractFunctions.filter((func) => func.stateMutability === "view" || func.stateMutability === "pure")
              .length === 0 && <p className="text-center py-4 text-muted-foreground">No read functions found</p>}
          </TabsContent>

          <TabsContent value="write">
            <Accordion type="single" collapsible className="w-full">
              {contractFunctions
                .filter((func) => func.stateMutability !== "view" && func.stateMutability !== "pure")
                .map((func, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-sm">
                      {func.name}
                      {func.inputs?.length > 0 && `(${func.inputs.map((input) => input.type).join(", ")})`}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-2">
                        {func.inputs?.length > 0 && (
                          <div className="space-y-2">
                            {func.inputs.map((input, inputIndex) => (
                              <div key={inputIndex} className="grid grid-cols-4 gap-2 items-center">
                                <Label className="text-xs">{input.name || `param${inputIndex}`}</Label>
                                <Input
                                  className="col-span-3"
                                  placeholder={input.type}
                                  value={functionInputs[func.name]?.[inputIndex] || ""}
                                  onChange={(e) => handleInputChange(func.name, inputIndex, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleFunctionCall(func.name, func.stateMutability)}
                          disabled={loading}
                        >
                          {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                          Execute
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
            {contractFunctions.filter((func) => func.stateMutability !== "view" && func.stateMutability !== "pure")
              .length === 0 && <p className="text-center py-4 text-muted-foreground">No write functions found</p>}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <a
            href={`https://${network === "ethereum" ? "" : network + "."}etherscan.io/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className={!contractAddress ? "pointer-events-none opacity-50" : ""}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </a>
        </Button>
        <Button onClick={handleLoadContract} disabled={loading || !contractAddress || !contractABI}>
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Load Contract"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

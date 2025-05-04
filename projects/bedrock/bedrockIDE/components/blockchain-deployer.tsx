"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Check, ExternalLink, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function BlockchainDeployer() {
  const [network, setNetwork] = useState("ethereum")
  const [contractAddress, setContractAddress] = useState("")
  const [contractABI, setContractABI] = useState("")
  const [deploymentStatus, setDeploymentStatus] = useState(null) // null, "loading", "success", "error"
  const [errorMessage, setErrorMessage] = useState("")

  const handleDeploy = async () => {
    setDeploymentStatus("loading")

    // Simulate deployment process
    setTimeout(() => {
      if (Math.random() > 0.2) {
        // 80% success rate for demo
        setDeploymentStatus("success")
        setContractAddress("0x1234567890abcdef1234567890abcdef12345678")
      } else {
        setDeploymentStatus("error")
        setErrorMessage("Failed to deploy contract. Please check your network connection and try again.")
      }
    }, 3000)
  }

  const handleVerify = async () => {
    setDeploymentStatus("loading")

    // Simulate verification process
    setTimeout(() => {
      setDeploymentStatus("success")
    }, 2000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Deploy to Blockchain</CardTitle>
        <CardDescription>Deploy your smart contracts to various blockchain networks</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deploy">
          <TabsList className="mb-4">
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
            <TabsTrigger value="verify">Verify</TabsTrigger>
            <TabsTrigger value="interact">Interact</TabsTrigger>
          </TabsList>

          <TabsContent value="deploy" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="network">Network</Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger id="network">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                    <SelectItem value="goerli">Goerli Testnet</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                    <SelectItem value="substrate">Substrate</SelectItem>
                  </SelectContent>
                </Select>
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

              {deploymentStatus === "success" && (
                <Alert variant="success">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>Contract deployed successfully at address: {contractAddress}</AlertDescription>
                </Alert>
              )}

              {deploymentStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="verify" className="space-y-4">
            <div className="grid gap-4">
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
                <Label htmlFor="contract-source">Contract Source Code</Label>
                <Textarea
                  id="contract-source"
                  placeholder="Paste your contract source code here"
                  className="font-mono text-sm h-32"
                />
              </div>

              {deploymentStatus === "success" && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>Verified!</AlertTitle>
                  <AlertDescription>Contract has been verified successfully.</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="interact" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="interact-address">Contract Address</Label>
                <Input
                  id="interact-address"
                  placeholder="0x..."
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Contract Functions</Label>
                <div className="border rounded-md p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Connect to a contract to view available functions</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <a href="https://etherscan.io" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Explorer
          </a>
        </Button>
        <Button onClick={handleDeploy} disabled={deploymentStatus === "loading"}>
          {deploymentStatus === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Deploy Contract"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

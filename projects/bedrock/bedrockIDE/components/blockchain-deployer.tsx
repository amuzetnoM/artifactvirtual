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
import { deployContract, verifyContract, callContractFunction, sendContractTransaction, getContractFunctions, getExplorerUrl } from "@/lib/blockchain-utils"

// Network configurations
const NETWORKS = {
  ethereum: { name: "Ethereum Mainnet", explorer: "https://etherscan.io" },
  sepolia: { name: "Sepolia Testnet", explorer: "https://sepolia.etherscan.io" },
  polygon: { name: "Polygon Mainnet", explorer: "https://polygonscan.com" },
  mumbai: { name: "Polygon Mumbai", explorer: "https://mumbai.polygonscan.com" },
  arbitrum: { name: "Arbitrum One", explorer: "https://arbiscan.io" },
  optimism: { name: "Optimism", explorer: "https://optimistic.etherscan.io" },
  bsc: { name: "BNB Smart Chain", explorer: "https://bscscan.com" },
};

export function BlockchainDeployer() {
  // State variables
  const [network, setNetwork] = useState("sepolia")
  const [contractAddress, setContractAddress] = useState("")
  const [contractABI, setContractABI] = useState("")
  const [contractBytecode, setContractBytecode] = useState("")
  const [contractSource, setContractSource] = useState("")
  const [deploymentStatus, setDeploymentStatus] = useState(null) // null, "loading", "success", "error"
  const [errorMessage, setErrorMessage] = useState("")
  const [constructorArgs, setConstructorArgs] = useState("")
  const [deployerPrivateKey, setDeployerPrivateKey] = useState("")
  const [contractFunctions, setContractFunctions] = useState([])
  const [selectedFunction, setSelectedFunction] = useState("")
  const [functionArgs, setFunctionArgs] = useState("")
  const [functionResult, setFunctionResult] = useState("")

  // Parse constructor arguments from string to array
  const parseConstructorArgs = () => {
    try {
      if (!constructorArgs.trim()) return [];
      return JSON.parse(constructorArgs);
    } catch (error) {
      console.error("Error parsing constructor arguments:", error);
      throw new Error("Invalid constructor arguments format. Please use JSON array format.");
    }
  };

  // Handle deployment
  const handleDeploy = async () => {
    try {
      if (!contractABI || !contractBytecode) {
        throw new Error("Contract ABI and bytecode are required");
      }
      
      setDeploymentStatus("loading");
      setErrorMessage("");
      
      // Parse constructor arguments
      const args = parseConstructorArgs();
      
      // Deploy contract
      const result = await deployContract(
        contractABI, 
        contractBytecode, 
        network,
        deployerPrivateKey || undefined,
        args
      );
      
      // Update state with deployment result
      setContractAddress(result.address);
      setDeploymentStatus("success");
    } catch (error) {
      console.error("Deployment error:", error);
      setDeploymentStatus("error");
      setErrorMessage(error.message || "Failed to deploy contract");
    }
  };

  // Handle verification
  const handleVerify = async () => {
    try {
      if (!contractAddress || !contractSource) {
        throw new Error("Contract address and source code are required");
      }
      
      setDeploymentStatus("loading");
      setErrorMessage("");
      
      const success = await verifyContract(contractAddress, contractSource, network);
      
      if (success) {
        setDeploymentStatus("success");
      } else {
        throw new Error("Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setDeploymentStatus("error");
      setErrorMessage(error.message || "Failed to verify contract");
    }
  };

  // Parse ABI to get functions
  const handleLoadFunctions = async () => {
    try {
      if (!contractABI || !contractAddress) {
        throw new Error("Contract ABI and address are required");
      }
      
      setDeploymentStatus("loading");
      const functions = await getContractFunctions(contractABI);
      setContractFunctions(functions);
      setDeploymentStatus(null);
    } catch (error) {
      console.error("Error loading functions:", error);
      setDeploymentStatus("error");
      setErrorMessage(error.message || "Failed to load contract functions");
    }
  };

  // Call contract function
  const handleCallFunction = async () => {
    try {
      if (!selectedFunction) {
        throw new Error("Please select a function");
      }
      
      setDeploymentStatus("loading");
      setFunctionResult("");
      
      // Parse function arguments
      const args = functionArgs.trim() ? JSON.parse(functionArgs) : [];
      
      // Find function in ABI to determine if it's a view/pure function or state-changing
      const functionDetails = contractFunctions.find(f => f.name === selectedFunction);
      
      let result;
      if (functionDetails.stateMutability === "view" || functionDetails.stateMutability === "pure") {
        // Call view/pure function
        result = await callContractFunction(
          contractAddress,
          contractABI,
          selectedFunction,
          args,
          network
        );
      } else {
        // Send transaction for state-changing function
        result = await sendContractTransaction(
          contractAddress,
          contractABI,
          selectedFunction,
          args,
          network,
          deployerPrivateKey || undefined
        );
      }
      
      setFunctionResult(typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result));
      setDeploymentStatus("success");
    } catch (error) {
      console.error("Function call error:", error);
      setDeploymentStatus("error");
      setErrorMessage(error.message || "Failed to call contract function");
    }
  };

  // Get explorer URL for the current network
  const getExplorerLink = () => {
    return NETWORKS[network]?.explorer || "https://etherscan.io";
  };

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
                    <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
                    <SelectItem value="polygon">Polygon Mainnet</SelectItem>
                    <SelectItem value="mumbai">Mumbai Testnet</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum One</SelectItem>
                    <SelectItem value="optimism">Optimism</SelectItem>
                    <SelectItem value="bsc">BNB Smart Chain</SelectItem>
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
                  className="font-mono text-sm h-24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract-bytecode">Contract Bytecode</Label>
                <Textarea
                  id="contract-bytecode"
                  placeholder="Paste your contract bytecode here (starting with 0x)"
                  value={contractBytecode}
                  onChange={(e) => setContractBytecode(e.target.value)}
                  className="font-mono text-sm h-24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="constructor-args">Constructor Arguments (JSON array format)</Label>
                <Input
                  id="constructor-args"
                  placeholder='e.g. ["Hello", 123]'
                  value={constructorArgs}
                  onChange={(e) => setConstructorArgs(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deployer-key">Deployer Private Key (optional)</Label>
                <Input
                  id="deployer-key"
                  type="password"
                  placeholder="0x..."
                  value={deployerPrivateKey}
                  onChange={(e) => setDeployerPrivateKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Never share your private key. This is only stored in memory during the deployment process.
                </p>
              </div>

              {deploymentStatus === "success" && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>
                    Contract deployed successfully at address: {contractAddress}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-normal" 
                      asChild
                    >
                      <a 
                        href={`${getExplorerLink()}/address/${contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Explorer <ExternalLink className="h-3 w-3 inline ml-1" />
                      </a>
                    </Button>
                  </AlertDescription>
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
                <Label htmlFor="network-verify">Network</Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger id="network-verify">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                    <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
                    <SelectItem value="polygon">Polygon Mainnet</SelectItem>
                    <SelectItem value="mumbai">Mumbai Testnet</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum One</SelectItem>
                    <SelectItem value="optimism">Optimism</SelectItem>
                    <SelectItem value="bsc">BNB Smart Chain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            
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
                  value={contractSource}
                  onChange={(e) => setContractSource(e.target.value)}
                />
              </div>

              {deploymentStatus === "success" && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>Verified!</AlertTitle>
                  <AlertDescription>
                    Contract has been verified successfully.
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-normal" 
                      asChild
                    >
                      <a 
                        href={`${getExplorerLink()}/address/${contractAddress}#code`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Explorer <ExternalLink className="h-3 w-3 inline ml-1" />
                      </a>
                    </Button>
                  </AlertDescription>
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

          <TabsContent value="interact" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="network-interact">Network</Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger id="network-interact">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                    <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
                    <SelectItem value="polygon">Polygon Mainnet</SelectItem>
                    <SelectItem value="mumbai">Mumbai Testnet</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum One</SelectItem>
                    <SelectItem value="optimism">Optimism</SelectItem>
                    <SelectItem value="bsc">BNB Smart Chain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                <Label htmlFor="interact-abi">Contract ABI</Label>
                <Textarea
                  id="interact-abi"
                  placeholder="Paste your contract ABI here"
                  value={contractABI}
                  onChange={(e) => setContractABI(e.target.value)}
                  className="font-mono text-sm h-24"
                />
                <Button onClick={handleLoadFunctions} disabled={!contractABI || !contractAddress || deploymentStatus === "loading"} variant="secondary" size="sm">
                  {deploymentStatus === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load Functions"
                  )}
                </Button>
              </div>

              {contractFunctions.length > 0 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="function-select">Select Function</Label>
                    <Select value={selectedFunction} onValueChange={setSelectedFunction}>
                      <SelectTrigger id="function-select">
                        <SelectValue placeholder="Select function" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractFunctions.map((func, index) => (
                          <SelectItem key={index} value={func.name}>
                            {func.name}(
                            {func.inputs?.map(input => `${input.type} ${input.name}`).join(', ')}
                            ) {func.outputs?.length > 0 ? '→ returns' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedFunction && (
                    <div className="space-y-2">
                      <Label htmlFor="function-args">Function Arguments (JSON array format)</Label>
                      <Input
                        id="function-args"
                        placeholder='e.g. ["0x123...", 100]'
                        value={functionArgs}
                        onChange={(e) => setFunctionArgs(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="private-key">Private Key (for state-changing functions)</Label>
                    <Input
                      id="private-key"
                      type="password"
                      placeholder="0x..."
                      value={deployerPrivateKey}
                      onChange={(e) => setDeployerPrivateKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Only required for functions that modify state</p>
                  </div>

                  <Button onClick={handleCallFunction} disabled={!selectedFunction || deploymentStatus === "loading"}>
                    {deploymentStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Call Function"
                    )}
                  </Button>

                  {functionResult && (
                    <div className="space-y-2">
                      <Label>Result</Label>
                      <div className="border rounded-md p-4 bg-muted">
                        <pre className="text-xs overflow-auto whitespace-pre-wrap">{functionResult}</pre>
                      </div>
                    </div>
                  )}
                </>
              )}

              {contractFunctions.length === 0 && !deploymentStatus && (
                <div className="border rounded-md p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Load the contract functions to interact with the contract</p>
                </div>
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
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <a href={getExplorerLink()} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Explorer
          </a>
        </Button>
        
        {/* Dynamic button based on active tab */}
        <Tabs.Consumer>
          {(tab) => {
            switch (tab?.value) {
              case "deploy":
                return (
                  <Button onClick={handleDeploy} disabled={deploymentStatus === "loading"}>
                    {deploymentStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      "Deploy Contract"
                    )}
                  </Button>
                );
              case "verify":
                return (
                  <Button onClick={handleVerify} disabled={deploymentStatus === "loading"}>
                    {deploymentStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Contract"
                    )}
                  </Button>
                );
              default:
                return null;
            }
          }}
        </Tabs.Consumer>
      </CardFooter>
    </Card>
  )
}

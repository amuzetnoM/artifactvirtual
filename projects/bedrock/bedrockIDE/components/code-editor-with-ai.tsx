"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { FileExplorer } from "@/components/file-explorer"
import { AIAssistant } from "@/components/ai-assistant"
import { CompilationOutput } from "@/components/compilation-output"
import { Play, Download, Upload, Save, PanelLeft, PanelRight, Terminal, Cpu, RefreshCw, Zap, Plus } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Template code for different languages
const TEMPLATES = {
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name;
    string public symbol;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    
    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply;
        balanceOf[msg.sender] = _totalSupply;
    }
    
    function transfer(address _to, uint256 _value) external returns (bool) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        return true;
    }
}`,
  rust: `use std::collections::HashMap;

pub struct Token {
    pub name: String,
    pub symbol: String,
    pub total_supply: u64,
    pub balances: HashMap<String, u64>,
}

impl Token {
    pub fn new(name: String, symbol: String, total_supply: u64, creator: String) -> Self {
        let mut balances = HashMap::new();
        balances.insert(creator, total_supply);
        
        Self {
            name,
            symbol,
            total_supply,
            balances,
        }
    }
    
    pub fn transfer(&mut self, from: String, to: String, amount: u64) -> Result<(), String> {
        let from_balance = self.balances.get(&from).copied().unwrap_or(0);
        
        if from_balance < amount {
            return Err("Insufficient balance".to_string());
        }
        
        *self.balances.entry(from).or_insert(0) -= amount;
        *self.balances.entry(to).or_insert(0) += amount;
        
        Ok(())
    }
}`,
  vyper: `# @version ^0.3.7

name: public(String[64])
symbol: public(String[32])
totalSupply: public(uint256)
balanceOf: public(HashMap[address, uint256])

@external
def __init__(_name: String[64], _symbol: String[32], _totalSupply: uint256):
    self.name = _name
    self.symbol = _symbol
    self.totalSupply = _totalSupply
    self.balanceOf[msg.sender] = _totalSupply

@external
def transfer(_to: address, _value: uint256) -> bool:
    assert self.balanceOf[msg.sender] >= _value, "Insufficient balance"
    self.balanceOf[msg.sender] -= _value
    self.balanceOf[_to] += _value
    return True`,
  hardhat: `const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let MyToken;
  let myToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    MyToken = await ethers.getContractFactory("MyToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    myToken = await MyToken.deploy("MyToken", "MTK", 1000000);
    await myToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await myToken.balanceOf(owner.address)).to.equal(1000000);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await myToken.balanceOf(owner.address);
      expect(await myToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await myToken.transfer(addr1.address, 50);
      const addr1Balance = await myToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await myToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await myToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await myToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner
      await expect(
        myToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Insufficient balance");

      // Owner balance shouldn't have changed
      expect(await myToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });
  });
});`,
}

// File system structure
type FileSystemItem = {
  id: string
  name: string
  type: "file" | "directory"
  content?: string
  language?: string
  children?: FileSystemItem[]
}

// Initial file system structure
const initialFileSystem: FileSystemItem[] = [
  {
    id: "1",
    name: "contracts",
    type: "directory",
    children: [
      {
        id: "2",
        name: "MyToken.sol",
        type: "file",
        language: "solidity",
        content: TEMPLATES.solidity,
      },
    ],
  },
  {
    id: "3",
    name: "tests",
    type: "directory",
    children: [
      {
        id: "4",
        name: "MyToken.test.js",
        type: "file",
        language: "hardhat",
        content: TEMPLATES.hardhat,
      },
    ],
  },
]

export function CodeEditorWithAI() {
  const { toast } = useToast()
  const [language, setLanguage] = useState("solidity")
  const [code, setCode] = useState(TEMPLATES.solidity)
  const [output, setOutput] = useState("")
  const [isCompiling, setIsCompiling] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [activeFile, setActiveFile] = useState<FileSystemItem | null>(null)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [newFileLanguage, setNewFileLanguage] = useState("solidity")
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [fileSystem, setFileSystem] = useLocalStorage<FileSystemItem[]>("bdp-file-system", initialFileSystem)

  // Set active file on initial load - only once
  useEffect(() => {
    if (!activeFile && fileSystem.length > 0 && fileSystem[0].children && fileSystem[0].children.length > 0) {
      const firstFile = fileSystem[0].children[0]
      setActiveFile(firstFile)
      if (firstFile.content) {
        setCode(firstFile.content)
      }
      if (firstFile.language) {
        setLanguage(firstFile.language)
      }
    }
  }, [fileSystem, activeFile])

  // Update code when active file changes
  useEffect(() => {
    if (activeFile && activeFile.content !== undefined) {
      setCode(activeFile.content)
      if (activeFile.language) {
        setLanguage(activeFile.language)
      }
    }
  }, [activeFile])

  // Save file content when code changes
  const saveFile = useCallback(() => {
    if (!activeFile) return

    const updatedFileSystem = [...fileSystem]

    // Helper function to find and update the file
    const updateFileInSystem = (items: FileSystemItem[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.id === activeFile.id) {
          items[i] = { ...item, content: code }
          return true
        }
        if (item.children) {
          if (updateFileInSystem(item.children)) {
            return true
          }
        }
      }
      return false
    }

    if (updateFileInSystem(updatedFileSystem)) {
      setFileSystem(updatedFileSystem)
      // Update the active file reference without triggering a re-render loop
      setActiveFile((prev) => (prev ? { ...prev, content: code } : null))
      toast({
        title: "File saved",
        description: `${activeFile.name} has been saved.`,
      })
    }
  }, [activeFile, code, fileSystem, setFileSystem, toast])

  const createNewFile = useCallback(() => {
    if (!newFileName) {
      toast({
        title: "Error",
        description: "Please enter a file name",
        variant: "destructive",
      })
      return
    }

    // Add file extension if not provided
    let fileName = newFileName
    if (!fileName.includes(".")) {
      const extension =
        newFileLanguage === "solidity"
          ? ".sol"
          : newFileLanguage === "rust"
            ? ".rs"
            : newFileLanguage === "vyper"
              ? ".vy"
              : ".js"
      fileName += extension
    }

    const newFile: FileSystemItem = {
      id: Date.now().toString(),
      name: fileName,
      type: "file",
      language: newFileLanguage,
      content: TEMPLATES[newFileLanguage] || "",
    }

    // Add to root if no directory is selected
    const updatedFileSystem = [...fileSystem]
    updatedFileSystem.push(newFile)
    setFileSystem(updatedFileSystem)
    setActiveFile(newFile)
    setCode(newFile.content || "")
    setLanguage(newFileLanguage)
    setShowNewFileDialog(false)
    setNewFileName("")
  }, [newFileName, newFileLanguage, fileSystem, setFileSystem])

  const handleCompile = useCallback(async () => {
    if (!activeFile) return

    setIsCompiling(true)
    setOutput("Compiling...")

    try {
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOutput(data.result)
      } else {
        setOutput(`Compilation failed: ${data.result || data.error}`)
      }
    } catch (error) {
      setOutput(`Compilation failed: ${error.message}`)
    } finally {
      setIsCompiling(false)
    }
  }, [activeFile, code, language])

  const handleDeploy = useCallback(async () => {
    if (!activeFile || language !== "solidity") {
      toast({
        title: "Deployment error",
        description: "Only Solidity contracts can be deployed.",
        variant: "destructive",
      })
      return
    }

    setIsDeploying(true)
    setOutput("Deploying...")

    try {
      // In a real implementation, you would extract the ABI and bytecode from the compilation output
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          abi: "[]", // Placeholder
          bytecode: "0x", // Placeholder
          network: "ethereum",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOutput(
          `Deployment successful!\n\nContract Address: ${data.contractAddress}\n\nTransaction Hash: ${data.transactionHash}\n\nGas Used: ${data.gasUsed}`,
        )
      } else {
        setOutput(`Deployment failed: ${data.error}`)
      }
    } catch (error) {
      setOutput(`Deployment failed: ${error.message}`)
    } finally {
      setIsDeploying(false)
    }
  }, [activeFile, language, toast])

  const handleAiAssist = useCallback(async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt for the AI assistant.",
        variant: "destructive",
      })
      return
    }

    setIsAiLoading(true)
    setAiResponse("Thinking...")

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          prompt: aiPrompt,
        }),
      })

      const data = await response.json()

      if (data.response) {
        setAiResponse(data.response)
      } else {
        setAiResponse(`Error: ${data.error || "Failed to get AI response"}`)
      }
    } catch (error) {
      setAiResponse(`Error: ${error.message}`)
    } finally {
      setIsAiLoading(false)
    }
  }, [aiPrompt, code, language, toast])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Save on Ctrl+S
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        saveFile()
      }
    },
    [saveFile],
  )

  // Handle code changes without causing re-renders
  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)
  }, [])

  return (
    <div className="flex flex-col h-screen" onKeyDown={handleKeyDown}>
      <div className="border-b p-2 flex items-center justify-between bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowLeftPanel(!showLeftPanel)} className="h-8 w-8">
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solidity">Solidity</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
              <SelectItem value="vyper">Vyper</SelectItem>
              <SelectItem value="hardhat">Hardhat</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground hidden md:inline-block">
            {language === "solidity"
              ? "Solidity v0.8.0"
              : language === "rust"
                ? "Rust 1.68.0"
                : language === "vyper"
                  ? "Vyper 0.3.7"
                  : "Hardhat 2.14.0"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={saveFile} className="h-8 w-8">
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save File (Ctrl+S)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Import File</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export File</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="ghost" size="icon" onClick={() => setShowRightPanel(!showRightPanel)} className="h-8 w-8">
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {showLeftPanel && (
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full border-r">
              <div className="p-2 border-b flex items-center justify-between">
                <h3 className="text-sm font-medium">Explorer</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowNewFileDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FileExplorer files={fileSystem} onFileSelect={setActiveFile} activeFile={activeFile} />
            </div>
          </ResizablePanel>
        )}

        <ResizablePanel defaultSize={showLeftPanel && showRightPanel ? 60 : 80}>
          <div className="h-full flex flex-col">
            <Tabs defaultValue="editor" className="flex-1">
              <TabsList className="mx-4 mt-2">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="flex-1 p-0">
                <div className="h-full border rounded-md m-2 font-mono text-sm">
                  <textarea
                    value={code}
                    onChange={handleCodeChange}
                    className="w-full h-full p-4 resize-none focus:outline-none bg-background"
                    spellCheck="false"
                  />
                </div>
              </TabsContent>

              <TabsContent value="output" className="flex-1 p-0">
                <div className="h-full border rounded-md m-2">
                  <CompilationOutput output={output} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="p-2 border-t flex justify-between">
              <div>
                <span className="text-xs text-muted-foreground">
                  {activeFile ? activeFile.name : "No file selected"} | {code.split("\n").length} lines
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCompile}
                  disabled={isCompiling || isDeploying || !activeFile}
                >
                  {isCompiling ? (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                      Compiling...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-3 w-3" />
                      {language === "hardhat" ? "Run Tests" : "Compile"}
                    </>
                  )}
                </Button>

                {language === "solidity" && (
                  <Button size="sm" onClick={handleDeploy} disabled={isCompiling || isDeploying || !activeFile}>
                    {isDeploying ? (
                      <>
                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-3 w-3" />
                        Deploy
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ResizablePanel>

        {showRightPanel && (
          <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
            <div className="h-full border-l">
              <Tabs defaultValue="ai">
                <TabsList className="w-full">
                  <TabsTrigger value="ai" className="flex-1">
                    <Cpu className="h-4 w-4 mr-2" />
                    AI Assistant
                  </TabsTrigger>
                  <TabsTrigger value="terminal" className="flex-1">
                    <Terminal className="h-4 w-4 mr-2" />
                    Terminal
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="p-0">
                  <AIAssistant
                    prompt={aiPrompt}
                    setPrompt={setAiPrompt}
                    response={aiResponse}
                    isLoading={isAiLoading}
                    onSubmit={handleAiAssist}
                  />
                </TabsContent>

                <TabsContent value="terminal" className="p-0">
                  <div className="p-2 h-full bg-black text-green-400 font-mono text-xs">
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      <div className="p-2">
                        <p>$ npm install</p>
                        <p>added 1284 packages in 25s</p>
                        <p>$ npx hardhat compile</p>
                        <p>Compiling 1 file with 0.8.0</p>
                        <p>Compilation finished successfully</p>
                        <p>$ _</p>
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>

      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
            <DialogDescription>Enter a name for your new file and select a language.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="MyContract.sol"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="language" className="text-right">
                Language
              </Label>
              <Select value={newFileLanguage} onValueChange={setNewFileLanguage}>
                <SelectTrigger id="language" className="col-span-3">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solidity">Solidity</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                  <SelectItem value="vyper">Vyper</SelectItem>
                  <SelectItem value="hardhat">Hardhat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFileDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createNewFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

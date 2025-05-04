"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Download, Upload, CodeIcon } from "lucide-react"
import { CodeEditorComponent } from "@/components/code-editor-component"
import { CompilationOutput } from "@/components/compilation-output"

const SOLIDITY_TEMPLATE = `// SPDX-License-Identifier: MIT
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
}`

const SUBSTRATE_TEMPLATE = `#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod my_token {
    use ink_storage::collections::HashMap;
    
    #[ink(storage)]
    pub struct MyToken {
        total_supply: Balance,
        balances: HashMap<AccountId, Balance>,
        name: String,
        symbol: String,
    }
    
    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        value: Balance,
    }
    
    impl MyToken {
        #[ink(constructor)]
        pub fn new(name: String, symbol: String, total_supply: Balance) -> Self {
            let mut balances = HashMap::new();
            let caller = Self::env().caller();
            balances.insert(caller, total_supply);
            
            Self::env().emit_event(Transfer {
                from: None,
                to: Some(caller),
                value: total_supply,
            });
            
            Self {
                total_supply,
                balances,
                name,
                symbol,
            }
        }
        
        #[ink(message)]
        pub fn transfer(&mut self, to: AccountId, value: Balance) -> bool {
            let from = self.env().caller();
            let from_balance = self.balance_of(from);
            
            if from_balance < value {
                return false;
            }
            
            self.balances.insert(from, from_balance - value);
            let to_balance = self.balance_of(to);
            self.balances.insert(to, to_balance + value);
            
            self.env().emit_event(Transfer {
                from: Some(from),
                to: Some(to),
                value,
            });
            
            true
        }
        
        #[ink(message)]
        pub fn balance_of(&self, owner: AccountId) -> Balance {
            self.balances.get(&owner).copied().unwrap_or(0)
        }
        
        #[ink(message)]
        pub fn total_supply(&self) -> Balance {
            self.total_supply
        }
        
        #[ink(message)]
        pub fn name(&self) -> String {
            self.name.clone()
        }
        
        #[ink(message)]
        pub fn symbol(&self) -> String {
            self.symbol.clone()
        }
    }
}`

export function CodeEditor() {
  const [language, setLanguage] = useState("solidity")
  const [code, setCode] = useState(SOLIDITY_TEMPLATE)
  const [output, setOutput] = useState("")
  const [isCompiling, setIsCompiling] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)

  const handleLanguageChange = (value) => {
    setLanguage(value)
    setCode(value === "solidity" ? SOLIDITY_TEMPLATE : SUBSTRATE_TEMPLATE)
    setOutput("")
  }

  const handleCompile = async () => {
    setIsCompiling(true)
    setOutput("Compiling...")

    // Simulate compilation
    setTimeout(() => {
      setOutput(
        'Compilation successful!\n\nBytecode: 0x608060405234801561001057600080fd5b50610...\n\nABI: [{\n  "inputs": [...],\n  "name": "transfer",\n  "outputs": [...],\n  "stateMutability": "nonpayable",\n  "type": "function"\n}]',
      )
      setIsCompiling(false)
    }, 2000)
  }

  const handleDeploy = async () => {
    setIsDeploying(true)
    setOutput("Deploying...")

    // Simulate deployment
    setTimeout(() => {
      setOutput(
        "Deployment successful!\n\nContract Address: 0x1234567890abcdef1234567890abcdef12345678\n\nTransaction Hash: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      )
      setIsDeploying(false)
    }, 3000)
  }

  return (
    <Card className="w-full">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solidity">Solidity</SelectItem>
              <SelectItem value="substrate">Substrate (Ink!)</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {language === "solidity" ? "Solidity v0.8.0" : "Substrate Ink! v3.0"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCode(language === "solidity" ? SOLIDITY_TEMPLATE : SUBSTRATE_TEMPLATE)}
          >
            <CodeIcon className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="editor">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="output">Output</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="p-0">
          <div className="h-[600px]">
            <CodeEditorComponent
              value={code}
              onChange={setCode}
              language={language === "solidity" ? "solidity" : "rust"}
            />
          </div>
          <div className="p-4 border-t flex justify-between">
            <div>
              <span className="text-sm text-muted-foreground">
                {code.split("\n").length} lines | {language}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCompile} disabled={isCompiling || isDeploying}>
                <Play className="mr-2 h-4 w-4" />
                Compile
              </Button>
              <Button onClick={handleDeploy} disabled={isCompiling || isDeploying}>
                Deploy
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="output" className="p-0">
          <CompilationOutput output={output} />
        </TabsContent>
      </Tabs>
    </Card>
  )
}

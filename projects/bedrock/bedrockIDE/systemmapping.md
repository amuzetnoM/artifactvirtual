# BedrockIDE & Bedrock System Mapping

This document provides an exhaustive mapping of both the BedrockIDE interface and the broader Bedrock blockchain development environment. This comprehensive reference will serve as a guide for the migration process and ensure we maintain feature parity while improving architecture.

## Table of Contents

1. [BedrockIDE System Mapping](#bedrockide-system-mapping)
   - [Components](#components)
   - [Pages](#pages)
   - [API Routes](#api-routes)
   - [UI Elements](#ui-elements)
   - [Hooks & Utilities](#hooks--utilities)
   - [State Management](#state-management)
   
2. [Broader Bedrock System Mapping](#broader-bedrock-system-mapping)
   - [Project Structure](#project-structure)
   - [Smart Contract Development](#smart-contract-development)
   - [Blockchain Integration](#blockchain-integration)
   - [Documentation](#documentation)
   - [Tools & Utilities](#tools--utilities)
   
3. [System Integration Points](#system-integration-points)
   - [IDE to Blockchain](#ide-to-blockchain)
   - [AI Integration](#ai-integration)
   - [CLI Opportunities](#cli-opportunities)
   - [Future Extension Points](#future-extension-points)

---

## BedrockIDE System Mapping

### Components

#### Core UI Components

| Component | File Location | Purpose | Features |
|-----------|--------------|---------|----------|
| `CodeEditorWithAI` | `/components/code-editor-with-ai.tsx` | Main editor interface | Code editing, file system, AI assistance |
| `FileExplorer` | `/components/file-explorer.tsx` | File navigation | File tree, selection, creation |
| `CodeEditor` | `/components/code-editor.tsx` | Basic code editor | Syntax highlighting, edit capabilities |
| `CodeEditorComponent` | `/components/code-editor-component.tsx` | Editor implementation | Text editing area |
| `AIAssistant` | `/components/ai-assistant.tsx` | AI interaction panel | Query submission, response display |
| `CompilationOutput` | `/components/compilation-output.tsx` | Shows compiler results | Output formatting, error highlighting |
| `ThemeProvider` | `/components/theme-provider.tsx` | Theme management | Light/dark mode |
| `HeroSection` | `/components/hero-section.tsx` | Landing page hero | Main marketing message |
| `Features` | `/components/features.tsx` | Features showcase | Platform capabilities |
| `Navbar` | `/components/navbar.tsx` | Navigation | Links, actions, branding |
| `Footer` | `/components/footer.tsx` | Page footer | Links, copyright |
| `CodeBlock` | `/components/code-block.tsx` | Code snippet display | Syntax highlighting, copy button |

#### UI Component Library (Shadcn/Radix)

| Component | File Location | Purpose |
|-----------|--------------|---------|
| `Button` | `/components/ui/button.tsx` | Interactive button element |
| `Dialog` | `/components/ui/dialog.tsx` | Modal dialogs |
| `Tabs` | `/components/ui/tabs.tsx` | Tabbed interface |
| `Select` | `/components/ui/select.tsx` | Dropdown selection |
| `Card` | `/components/ui/card.tsx` | Container with styling |
| `Form` | `/components/ui/form.tsx` | Form elements and validation |
| `Input` | `/components/ui/input.tsx` | Text input |
| `Label` | `/components/ui/label.tsx` | Text label |
| `Toaster` | `/components/ui/toaster.tsx` | Toast notifications |
| `Toast` | `/components/ui/toast.tsx` | Individual toast |
| `Tooltip` | `/components/ui/tooltip.tsx` | Hover tooltips |
| `ResizablePanels` | `/components/ui/resizable.tsx` | Drag-resizable panels |
| `ScrollArea` | `/components/ui/scroll-area.tsx` | Scrollable container |
| `Separator` | `/components/ui/separator.tsx` | Visual divider |
| `Sheet` | `/components/ui/sheet.tsx` | Side panel/drawer |
| `Skeleton` | `/components/ui/skeleton.tsx` | Loading placeholder |
| `Sidebar` | `/components/ui/sidebar.tsx` | Navigation sidebar |

### Pages

| Page | File Location | Purpose | Key Components |
|------|--------------|---------|----------------|
| Home/Landing | `/app/page.tsx` | Main entry point | HeroSection, Features |
| Code Editor | `/app/code-editor/page.tsx` | Editor interface | CodeEditorWithAI |
| Root Layout | `/app/layout.tsx` | App shell | ThemeProvider, Toaster |

### API Routes

| Route | File Location | Purpose | Methods |
|-------|--------------|---------|---------|
| AI Assistant | `/app/api/ai/route.ts` | Ollama integration | POST |
| Compilation | `/app/api/compile/route.ts` (inferred) | Code compilation | POST |
| Deployment | `/app/api/deploy/route.ts` (inferred) | Contract deployment | POST |

### UI Elements

#### Editor Interface

| Element | Parent Component | Purpose | Interaction |
|---------|-----------------|---------|-------------|
| Language Selector | `CodeEditorWithAI` | Select programming language | Dropdown |
| File Tree | `FileExplorer` | Navigate files | Click to select |
| Text Editor | `CodeEditorComponent` | Edit code | Text input |
| Compile Button | `CodeEditorWithAI` | Compile code | Click to compile |
| Deploy Button | `CodeEditorWithAI` | Deploy contract | Click to deploy |
| Save Button | `CodeEditorWithAI` | Save file | Click to save |
| New File Button | `CodeEditorWithAI` | Create file | Click to create |
| AI Query Input | `AIAssistant` | Enter AI prompt | Text input |
| AI Submit Button | `AIAssistant` | Send to AI | Click to send |
| Output Panel | `CompilationOutput` | Show results | Read-only |
| Panel Resizers | `ResizablePanels` | Resize interface sections | Drag to resize |
| Theme Toggle | `Navbar` | Switch theme | Click to toggle |

### Hooks & Utilities

| Hook/Utility | File Location | Purpose |
|--------------|--------------|---------|
| `useLocalStorage` | `/hooks/use-local-storage.ts` | Persist data in localStorage |
| `useToast` | `/hooks/use-toast.ts` | Show toast notifications |
| `useIsMobile` | `/hooks/use-mobile.ts` | Responsive design helper |
| `cn` | `/lib/utils.ts` | Class name utility function |

### State Management

| State | Component | Purpose | Persistence |
|-------|----------|---------|-------------|
| Active File | `CodeEditorWithAI` | Currently edited file | Local state |
| File System | `CodeEditorWithAI` | File structure data | localStorage |
| Editor Content | `CodeEditorWithAI` | Current file content | Local state |
| Selected Language | `CodeEditorWithAI` | Current language | Local state |
| Compilation Status | `CodeEditorWithAI` | Compilation state | Local state |
| Deployment Status | `CodeEditorWithAI` | Deployment state | Local state |
| AI Query | `AIAssistant` | Current AI prompt | Local state |
| AI Response | `AIAssistant` | AI assistant response | Local state |
| Panel Visibility | `CodeEditorWithAI` | UI panel toggle state | Local state |
| Theme | `ThemeProvider` | Current color theme | localStorage |

---

## Broader Bedrock System Mapping

### Project Structure

| Directory | Purpose | Key Contents |
|-----------|---------|--------------|
| `/bedrock` | Root project directory | Configuration files, README |
| `/bedrock/bedrockIDE` | Web IDE implementation | Next.js app |
| `/bedrock/core` | Core shared functionality | Common utilities |
| `/bedrock/contracts` | Smart contract examples | Solidity, Vyper, other languages |
| `/bedrock/docs` | Documentation | Guides, references |
| `/bedrock/rust` | Rust blockchain library | Cross-chain interfaces |
| `/bedrock/clients` | dApp frontend examples | Web, mobile |
| `/bedrock/scripts` | Utility scripts | Deployment, migration |
| `/bedrock/tests` | Test suite | Unit, integration tests |
| `/bedrock/libraries` | External libraries | Codex and references |

### Smart Contract Development

#### Supported Languages

| Language | Directory | Tooling | Target Platforms |
|----------|-----------|---------|-----------------|
| Solidity | `/contracts/ethereum` | Hardhat | Ethereum, EVM chains |
| Vyper | `/contracts/ethereum/vyper` | Vyper compiler | Ethereum |
| Rust | `/contracts/solana` | Rust/Anchor | Solana |
| Cairo | `/contracts/starknet` | Cairo toolchain | StarkNet |
| Plutus | `/contracts/cardano` | Haskell/Plutus | Cardano |

#### Development Tools

| Tool | Integration | Purpose |
|------|------------|---------|
| Hardhat | Configuration in root | Ethereum development framework |
| TypeScript | Project-wide | Type safety |
| Mocha/Chai | Test framework | Testing contracts |
| Ethers.js | Contract interaction | JavaScript Ethereum API |
| Foundry | Alternative tooling | Fast Ethereum testing |
| Anchor | Solana framework | Solana development |

### Blockchain Integration

#### Ethereum Integration

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| Contract Compilation | Hardhat | Compile Solidity/Vyper |
| Contract Testing | Hardhat test | Run contract tests |
| Network Configuration | hardhat.config.ts | Configure networks |
| Contract Deployment | Scripts | Deploy to networks |
| Contract Verification | Hardhat plugin | Verify on explorers |
| Gas Optimization | Documentation | Best practices |

#### Solana Integration

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| Program Compilation | Rust/Anchor | Compile Solana programs |
| Program Testing | Anchor test | Test programs |
| Program Deployment | Anchor deploy | Deploy to clusters |
| Client Integration | @solana/web3.js | Web integration |

#### Cross-Chain Features

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| Unified Interface | Rust library | Common blockchain API |
| Type Safety | TypeScript/Rust | Safe interactions |
| Multiple Network Support | Configuration | Test, mainnet, custom |

### Documentation

| Document | File Location | Purpose |
|----------|--------------|---------|
| Ethereum Guide | `/docs/ethereum-development.md` | Ethereum development |
| Solana Guide | `/docs/solana-development.md` | Solana development |
| Full-Stack Guide | `/docs/fullstack-dapp-guide.md` | Complete dApp creation |
| Project Setup | `/docs/project-setup-guide.md` | Environment setup |
| Troubleshooting | `/docs/troubleshooting.md` | Common issues |
| Rust Library | `/docs/rust-blockchain-lib.md` | Rust library usage |

### Tools & Utilities

| Tool | Location | Purpose |
|------|---------|---------|
| Hardhat | Root config | Ethereum development |
| Rust Library | `/rust` | Blockchain interaction |
| Deployment Scripts | `/scripts/deploy` | Contract deployment |
| Migration Scripts | `/scripts/migration` | Data migration |
| Testing Framework | `/tests` | Automated testing |
| Example Contracts | `/contracts` | Reference implementations |
| Example Clients | `/clients` | Frontend samples |

---

## System Integration Points

### IDE to Blockchain

| Integration Point | Current Implementation | Purpose |
|-------------------|----------------------|---------|
| Compilation | API route to Hardhat | Compile contracts |
| Deployment | API route to Hardhat | Deploy contracts |
| Testing | API route to test runner | Run contract tests |
| Network Selection | UI dropdown | Select target network |

### AI Integration

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| Code Analysis | Ollama API | Analyze code quality |
| Code Completion | Ollama API | Suggest code |
| Documentation Generation | Ollama API | Generate docs |
| Error Explanation | Ollama API | Explain errors |
| Contract Auditing | Ollama API | Security suggestions |

### CLI Opportunities

| Feature | Current Status | Potential Implementation |
|---------|---------------|--------------------------|
| Project Initialization | Manual | CLI command |
| Contract Compilation | IDE only | CLI command |
| Contract Deployment | IDE only | CLI command |
| Network Management | Config files | CLI interface |
| AI Integration | IDE only | CLI assistant |
| Testing | IDE/script | CLI test runner |
| Code Generation | Manual/AI | CLI scaffolding |

### Future Extension Points

| Feature | Status | Potential Implementation |
|---------|--------|--------------------------|
| Multi-Chain Wallet | Not implemented | Browser extension integration |
| Collaborative Editing | Not implemented | WebSocket/Operational Transform |
| Version Control | Not implemented | Git integration |
| CI/CD Pipeline | Not implemented | GitHub Actions integration |
| Formal Verification | Not implemented | Tool integration |
| Cross-Chain Operations | Limited | Expanded bridge support |
| Advanced Simulation | Not implemented | Tenderly/fork integration |
| Mobile Support | Not implemented | Responsive design/PWA |
| User Authentication | Not implemented | Web3 auth/traditional auth |
| Plugin System | Not implemented | Extension API |
| Custom Templates | Basic | Template marketplace |
| Analytics | Not implemented | Usage tracking (opt-in) |
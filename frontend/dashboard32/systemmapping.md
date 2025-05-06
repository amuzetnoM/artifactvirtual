# Artifact Virtual System Mapping

## Overview
This document provides a comprehensive mapping of the Artifact Virtual system, including all routes, components, functions, and integration points. This mapping is essential for seamless integration with middleware, backend services, client applications, and external tools.

## Table of Contents
1. [Application Structure](#application-structure)
2. [Routes and Pages](#routes-and-pages)
3. [Components](#components)
4. [State Management](#state-management)
5. [API Endpoints](#api-endpoints)
6. [Integration Points](#integration-points)
7. [Authentication Flow](#authentication-flow)
8. [Data Models](#data-models)
9. [Services](#services)
10. [Utilities](#utilities)

## Application Structure

### Root Structure
\`\`\`
/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Dashboard overview
│   ├── ai-ecosystems/    # AI Ecosystems section
│   ├── blockchain/       # Blockchain section
│   ├── knowledge/        # Knowledge Foundations section
│   ├── projects/         # Projects section
│   ├── research/         # Research section
│   ├── servers/          # Server Management section
│   ├── system/           # System Management section
│   ├── quantum/          # Quantum Computing section
│   └── applications/     # Applications section
├── components/           # React components
│   ├── ui/               # UI components (shadcn)
│   ├── navigation/       # Navigation components
│   └── [feature]/        # Feature-specific components
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
├── public/               # Static assets
└── styles/               # Global styles
\`\`\`

## Routes and Pages

### Main Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `DashboardOverview` | Main dashboard with overview of all systems |
| `/projects` | `ProjectsDashboard` | Projects management |
| `/research` | `ResearchDashboard` | Research projects and experiments |
| `/ai-ecosystems` | `AIEcosystemsDashboard` | AI models and ecosystems management |
| `/ai-ecosystems/lab` | `AILabDashboard` | AI experimentation lab |
| `/ai-ecosystems/models` | `AIModelsDashboard` | AI model management |
| `/ai-ecosystems/quantization` | `ModelQuantizationDashboard` | Model quantization tools |
| `/ai-ecosystems/protocols` | `CommunicationProtocolsDashboard` | Communication protocols management |
| `/knowledge` | `KnowledgeDashboard` | Knowledge foundations management |
| `/knowledge/datasets` | `DatasetsDashboard` | Dataset management |
| `/knowledge/library` | `LibraryDashboard` | Document library |
| `/knowledge/uploader` | `DocumentUploaderDashboard` | Document upload interface |
| `/blockchain` | `BlockchainDashboard` | Blockchain development tools |
| `/blockchain/wallets` | `BlockchainWalletsDashboard` | Blockchain wallets management |
| `/blockchain/networks` | `BlockchainNetworksDashboard` | Blockchain networks configuration |
| `/blockchain/contracts` | `SmartContractsDashboard` | Smart contracts management |
| `/blockchain/ide` | `BlockchainIDEDashboard` | Blockchain development IDE |
| `/blockchain/tasks` | `BlockchainTasksDashboard` | Blockchain tasks management |
| `/servers` | `ServerManagementDashboard` | Server management interface |
| `/servers/data` | `DataServersDashboard` | Data servers management |
| `/servers/sensory` | `SensoryServersDashboard` | Sensory servers management |
| `/servers/mcp` | `MCPServersDashboard` | MCP servers management |
| `/system` | `SystemManagementDashboard` | System management interface |
| `/system/storage` | `StorageManagementDashboard` | Storage management |
| `/system/gpu` | `GPUManagementDashboard` | GPU management |
| `/system/cooling` | `CoolingManagementDashboard` | System cooling management |
| `/quantum` | `QuantumComputingDashboard` | Quantum computing interface |
| `/applications` | `ApplicationsDashboard` | Applications management |
| `/applications/meteor` | `MeteorEditorDashboard` | Meteor Markdown Editor |
| `/applications/oracle` | `OracleCLIDashboard` | Oracle CLI interface |
| `/applications/calendar` | `TemporalCalendarDashboard` | Temporal Calendar application |

## Components

### Layout Components
| Component | Description | Props |
|-----------|-------------|-------|
| `DashboardLayout` | Main layout for all dashboard pages | `children: React.ReactNode` |
| `SidebarNavigation` | Main sidebar navigation | None |
| `Header` | Top header with search and user controls | None |
| `AvaAssistant` | Floating assistant interface | `className?: string` |

### UI Components
| Component | Description | Props |
|-----------|-------------|-------|
| `Logo` | Application logo | `className?: string, size?: "sm" \| "md" \| "lg", showText?: boolean` |
| `Button` | Enhanced button with glow effect | Standard button props + `variant, size, asChild` |
| `Card` | Card component with hover effects | Standard card props |
| `ChatPanel` | Reusable chat interface | `id: string, title: string, icon?: React.ReactNode, messages?: ChatMessage[], onSend?: (message: string) => void, onClose?: () => void, className?: string, modelInfo?: { name: string, provider: string, avatar?: string }` |

### Feature Components
| Component | Description | Props |
|-----------|-------------|-------|
| `AILabDashboard` | AI experimentation interface | None |
| `ServerManagementDashboard` | Server management interface | None |
| `ProjectsDashboard` | Projects management interface | None |
| `ResearchDashboard` | Research projects interface | None |
| `SystemManagementDashboard` | System management interface | None |
| `QuantumComputingDashboard` | Quantum computing interface | None |
| `BlockchainWalletsDashboard` | Blockchain wallets interface | None |

## State Management

### Global State
- Theme state (light/dark mode)
- Sidebar state (expanded/collapsed)
- User authentication state

### Component-Level State
| Component | State | Description |
|-----------|-------|-------------|
| `AILabDashboard` | `chatInstances` | Manages multiple chat instances |
| `ServerManagementDashboard` | `servers` | Manages server configurations |
| `BlockchainWalletsDashboard` | `showPrivateKey` | Controls visibility of private keys |
| `AvaAssistant` | `isOpen, isExpanded, messages` | Controls assistant UI state |

## API Endpoints

### AI Services
| Endpoint | Method | Description | Parameters | Response |
|----------|--------|-------------|------------|----------|
| `/api/ai/models` | GET | Get available AI models | None | List of models |
| `/api/ai/chat` | POST | Send message to AI model | `{ model: string, messages: Message[] }` | AI response |
| `/api/ai/quantize` | POST | Start model quantization | `{ model: string, bits: number, groupSize: number }` | Job status |

### Knowledge Services
| Endpoint | Method | Description | Parameters | Response |
|----------|--------|-------------|------------|----------|
| `/api/knowledge/datasets` | GET | Get available datasets | None | List of datasets |
| `/api/knowledge/documents` | GET | Get documents | `{ category?: string }` | List of documents |
| `/api/knowledge/upload` | POST | Upload document | `FormData` | Upload status |

### Blockchain Services
| Endpoint | Method | Description | Parameters | Response |
|----------|--------|-------------|------------|----------|
| `/api/blockchain/wallets` | GET | Get wallets | None | List of wallets |
| `/api/blockchain/transactions` | GET | Get transactions | `{ wallet: string }` | List of transactions |
| `/api/blockchain/deploy` | POST | Deploy contract | `{ contract: string, network: string }` | Deployment status |

### Server Management
| Endpoint | Method | Description | Parameters | Response |
|----------|--------|-------------|------------|----------|
| `/api/servers` | GET | Get servers | None | List of servers |
| `/api/servers` | POST | Create server | `{ name: string, type: string, endpoint: string, port: number }` | Server config |
| `/api/servers/:id` | PUT | Update server | `{ status: string }` | Updated server |
| `/api/servers/:id` | DELETE | Delete server | None | Deletion status |

### System Management
| Endpoint | Method | Description | Parameters | Response |
|----------|--------|-------------|------------|----------|
| `/api/system/metrics` | GET | Get system metrics | None | System metrics |
| `/api/system/storage` | GET | Get storage info | None | Storage metrics |
| `/api/system/memory` | GET | Get memory info | None | Memory metrics |
| `/api/system/gpu` | GET | Get GPU info | None | GPU metrics |

## Integration Points

### External Services
| Service | Integration Type | Purpose | Configuration |
|---------|------------------|---------|---------------|
| OpenAI | API | AI model inference | API key in environment variables |
| Anthropic | API | AI model inference | API key in environment variables |
| Google AI | API | AI model inference | API key in environment variables |
| Ollama | Local API | Local AI model inference | Local server configuration |
| Ethereum | RPC | Blockchain interaction | RPC endpoint configuration |
| Celo | RPC | Blockchain interaction | RPC endpoint configuration |
| Optimism | RPC | Blockchain interaction | RPC endpoint configuration |

### Internal Services
| Service | Purpose | Integration Method |
|---------|---------|-------------------|
| Model Context Protocol | Context provision for AI models | Internal API |
| Knowledge Base | Structured knowledge storage | Internal API |
| File Storage | Document and asset storage | Internal API |
| Quantization Service | Model optimization | Internal API |

## Authentication Flow

1. User login via credentials or OAuth
2. JWT token generation and storage
3. Token validation on protected routes
4. Refresh token mechanism
5. Role-based access control

## Data Models

### User
\`\`\`typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user" | "developer";
  createdAt: Date;
  lastLogin: Date;
}
\`\`\`

### AI Model
\`\`\`typescript
interface AIModel {
  id: string;
  name: string;
  provider: string;
  size: string;
  quantization: string | null;
  status: "loaded" | "available" | "loading";
  capabilities: string[];
}
\`\`\`

### Server
\`\`\`typescript
interface Server {
  id: string;
  name: string;
  type: "data" | "sensory" | "mcp";
  endpoint: string;
  status: "online" | "offline" | "error";
  port: number;
  secure: boolean;
  createdAt: Date;
  lastActive?: Date;
  description?: string;
}
\`\`\`

### Wallet
\`\`\`typescript
interface Wallet {
  id: string;
  name: string;
  address: string;
  network: string;
  chainId: number;
  balance: string;
  privateKey: string;
}
\`\`\`

### Project
\`\`\`typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "planning" | "completed";
  progress: number;
  lastUpdated: Date;
  tags: string[];
}
\`\`\`

## Services

### AIService
Methods for interacting with AI models, including:
- `getModels()`: Get available models
- `chat(model, messages)`: Send messages to model
- `quantize(model, options)`: Quantize model
- `loadModel(model)`: Load model into memory
- `unloadModel(model)`: Unload model from memory

### KnowledgeService
Methods for managing knowledge:
- `getDatasets()`: Get available datasets
- `getDocuments(category)`: Get documents by category
- `uploadDocument(document, metadata)`: Upload document
- `searchKnowledge(query)`: Search knowledge base

### BlockchainService
Methods for blockchain interactions:
- `getWallets()`: Get available wallets
- `getTransactions(wallet)`: Get transactions for wallet
- `sendTransaction(from, to, amount)`: Send transaction
- `deployContract(contract, network)`: Deploy smart contract
- `compileContract(source)`: Compile smart contract

### ServerService
Methods for server management:
- `getServers()`: Get all servers
- `createServer(config)`: Create new server
- `updateServer(id, config)`: Update server configuration
- `deleteServer(id)`: Delete server
- `startServer(id)`: Start server
- `stopServer(id)`: Stop server

### SystemService
Methods for system management:
- `getMetrics()`: Get system metrics
- `getStorageInfo()`: Get storage information
- `getMemoryInfo()`: Get memory information
- `getGPUInfo()`: Get GPU information
- `optimizeMemory()`: Optimize memory usage
- `optimizeStorage()`: Optimize storage usage

## Utilities

### API Utilities
- `fetchWithAuth(url, options)`: Fetch with authentication
- `handleApiError(error)`: Standardized API error handling

### Data Utilities
- `formatBytes(bytes)`: Format bytes to human-readable format
- `formatDate(date)`: Format date consistently
- `truncateAddress(address)`: Truncate blockchain addresses

### UI Utilities
- `cn(...classes)`: Merge class names
- `formatDuration(ms)`: Format milliseconds to readable duration
- `copyToClipboard(text)`: Copy text to clipboard

### Authentication Utilities
- `isAuthenticated()`: Check if user is authenticated
- `hasPermission(permission)`: Check if user has permission
- `logout()`: Log out user
- `refreshToken()`: Refresh authentication token
\`\`\`

Let's update the plan.md file to reflect our progress:

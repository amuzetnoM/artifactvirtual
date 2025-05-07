# Cybertron Flow

A powerful node-based workflow automation platform built with Angular, enabling visual design and execution of complex workflows.

![Cybertron Flow Banner](./assets/cybertron-flow-banner.png)

## Overview

Cybertron Flow provides a visual workflow builder that allows users to automate complex processes by connecting different types of nodes together. Each node represents a specific functionality, such as interacting with AI models, executing custom scripts, scheduling tasks, or generating reports.

The platform is designed to be extensible, secure, and user-friendly, making it suitable for a wide range of automation scenarios, from simple data processing to complex multi-step workflows involving AI, API integrations, and scheduled tasks.

## Features

- **Visual Workflow Designer**: Intuitive drag-and-drop interface
- **Multiple Node Types**:
  - **Chat Agent**: Interact with LLMs and AI assistants
  - **Integration**: Connect to external APIs and services
  - **Scheduler**: Run workflows on schedules (CRON, interval, one-time)
  - **Task**: Execute custom JavaScript code in a secure sandbox
  - **Report**: Generate reports in various formats and destinations
  - **Pinned Input**: Store and reuse input values
- **Real-time Execution**: Execute workflows and see results instantly
- **Secure Script Execution**: Run custom code safely with VM2 sandboxing
- **Import/Export**: Save, share, and restore workflows as JSON
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Modern UI**: Clean design with responsive layout and consistent styling

## Installation

### Prerequisites

- Node.js 14+
- npm or yarn
- Angular CLI 14+

### Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/cybertron-flow.git
cd cybertron-flow
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Navigate to `http://localhost:4200` in your browser

### Building for Production

```bash
ng build --prod
```

The build artifacts will be stored in the `dist/` directory.

## Usage Guide

### Creating a New Workflow

1. Open Cybertron Flow in your browser
2. Use the toolbar to add nodes to the canvas
3. Configure each node using the sidebar settings panel
4. Connect nodes by clicking and dragging from one node's output to another node's input
5. Save your workflow using the toolbar buttons

### Node Types

#### Chat Agent Node

Connects to AI models like GPT-3.5, GPT-4, Claude, or local models:

- Configure model selection
- Set system prompts
- Process inputs and generate natural language outputs

#### Integration Node

Connects to external services:

- Support for various platforms (Google Calendar, Notion, Slack, etc.)
- API key and authentication configuration
- Request/response mapping

#### Scheduler Node

Triggers workflows based on time:

- CRON expressions
- Interval scheduling (hourly, daily, etc.)
- One-time future execution

#### Task Node

Executes JavaScript code:

- Secure VM2 sandboxing
- Configurable security levels
- Support for approved libraries
- Input/output processing

#### Report Node

Generates formatted reports:

- Multiple formats (JSON, CSV, TXT)
- Multiple destinations (file, email, webhook, dashboard)
- Customizable templates

#### Pinned Input Node

Stores reusable values:

- Text, number, and structured data support
- Timestamped inputs
- Persistence across workflow executions

### Executing Workflows

1. Click the "Run Workflow" button in the toolbar
2. Watch the execution progress through the workflow
3. Node states will update in real-time with success/failure indicators
4. View detailed results in the node's state panel

### Importing and Exporting

- Use the "Export" button to save your workflow as JSON
- Use the "Import" button to load previously saved workflows
- Share workflows with team members or across environments

## Architecture

Cybertron Flow is built with a modern Angular architecture:

```
/cybertron-flow
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── node-settings/          # Node configuration components
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── orchestrator.service.ts # Core workflow execution
│   │   │   ├── permission.service.ts   # User access control
│   │   │   └── ...
│   │   ├── node-types/
│   │   │   └── node.model.ts           # Node type definitions
│   │   ├── cybertron-flow.component.ts # Main component
│   │   └── app.module.ts               # Module definition
│   └── assets/                         # Static resources
└── ...
```

### Key Components

- **CybertronNode**: Interface defining node properties and behavior
- **OrchestratorService**: Manages workflow execution and node interactions
- **Node Settings Components**: Type-specific configuration UI for each node
- **ngx-graph**: Powers the visual workflow canvas and node connections

## Recent Enhancements

See [UPDATES.md](./UPDATES.md) for detailed information about recent enhancements, including:

1. Replacement of custom canvas rendering with ngx-graph
2. Implementation of secure script execution with VM2
3. Improved state management and UI architecture
4. Addition of a comprehensive icon system
5. Enhanced UI/UX design
6. Specialized node type implementations
7. Various other improvements to performance, security, and usability

## Contributing

We welcome contributions to Cybertron Flow! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- [ngx-graph](https://github.com/swimlane/ngx-graph) for graph visualization
- [FontAwesome](https://fontawesome.com/) for icons
- [VM2](https://github.com/patriksimek/vm2) for secure script execution
- [Angular](https://angular.io/) framework and community

---

_Cybertron Flow: Automate Everything. Unleash Productivity. Be Cybertron._

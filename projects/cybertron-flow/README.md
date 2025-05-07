# Cybertron Flow Orchestrator

Cybertron Flow is a next-generation, node-based workflow automation and orchestration platform. It empowers users to visually design, automate, and execute complex AI, data, and integration workflows with advanced productivity features, parallel processing, and extensibility.

## Features
- Visual node graph editor (drag-and-drop, zoom, pan)
- Node types: Chat Agent, Integration, Scheduler, Task, Report, Pinned Input
- Pin any user input (text, command, file, etc.) as a workflow node for temporal scheduling and automation
- Parallel workflow execution for maximum throughput
- Advanced scheduling (recurring, interval, CRON, time zones)
- Real API integrations (REST, GraphQL, Webhooks, OAuth2)
- Custom script/task nodes (user-defined logic, code execution)
- Multi-modal AI support (LangChain, local/remote models)
- Workflow import/export, save/load, and versioning
- Real-time validation, error feedback, and analytics
- Collaboration and multi-user support (planned)
- Extensible: pluggable node types, theming, and branding

## Getting Started
1. Clone the repository and install dependencies
2. Start the backend and frontend servers
3. Access the Cybertron Flow dashboard in your browser
4. Drag nodes, connect them, and design your workflow
5. Pin user inputs or commands to the board for instant automation
6. Run, schedule, and monitor your workflows in real time

## User Roles & Permissions

Cybertron Flow supports role-based access control for workflow actions:

- **admin**: Full access (create, update, delete, execute)
- **editor**: Can create, update, and execute workflows
- **viewer**: Read-only, cannot modify or execute workflows

Permission checks are enforced in the orchestrator service for all workflow actions. See `src/app/services/permission.service.ts` for the user/role model and permission logic.

| Action   | Admin | Editor | Viewer |
|----------|-------|--------|--------|
| Create   |   ✓   |   ✓    |   ✗    |
| Update   |   ✓   |   ✓    |   ✗    |
| Delete   |   ✓   |   ✗    |   ✗    |
| Execute  |   ✓   |   ✓    |   ✗    |

## Roadmap
- Real-time collaboration
- Advanced analytics and workflow insights
- Pluggable node/plugin system
- Security and access control
- Performance optimization for large-scale workflows

## Contributing
Contributions are welcome! Please see the [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

---

_Cybertron Flow: Automate Everything. Unleash Productivity. Be Cybertron._

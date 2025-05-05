# BedrockIDE Angular System Mapping

This document provides a comprehensive mapping of the BedrockIDE Angular implementation, highlighting the architecture, components, services, and integration points of the application.

## Table of Contents

1. [Application Structure](#application-structure)
   - [Components](#components)
   - [Services](#services)
   - [Modules](#modules)
   
2. [Data Flow & State Management](#data-flow--state-management)
   - [Component Interaction](#component-interaction)
   - [Service Communication](#service-communication)
   - [RxJS Usage](#rxjs-usage)

3. [UI Elements & Features](#ui-elements--features)
   - [Editor Interface](#editor-interface)
   - [AI Assistant](#ai-assistant)
   - [File System](#file-system)
   - [Compilation Output](#compilation-output)

4. [Theme System](#theme-system)
   - [Light/Dark Mode](#lightdark-mode)
   - [CSS Variables](#css-variables)
   - [Component Styling](#component-styling)

5. [Integration Points](#integration-points)
   - [Monaco Editor](#monaco-editor)
   - [AI Service](#ai-service)
   - [Compilation Service](#compilation-service)

6. [Future Extensions](#future-extensions)
   - [Missing Features](#missing-features)
   - [Enhancement Opportunities](#enhancement-opportunities)

---

## Application Structure

### Components

| Component | File Path | Purpose | Features |
|-----------|-----------|---------|----------|
| `AppComponent` | `/app.component.ts` | Root component | Application shell, routing container |
| `HeaderComponent` | `/components/header/header.component.ts` | Application header | Navigation, theme toggle, branding |
| `FooterComponent` | `/components/footer/footer.component.ts` | Application footer | Links, copyright, information |
| `LandingPageComponent` | `/components/landing-page/landing-page.component.ts` | Home page | Introduction, features showcase |
| `CodeEditorComponent` | `/components/code-editor/code-editor.component.ts` | Core editor interface | Monaco editor, file handling, compilation |
| `FileExplorerComponent` | `/components/file-explorer/file-explorer.component.ts` | File navigation | File tree, creation, selection |
| `AiAssistantComponent` | `/components/ai-assistant/ai-assistant.component.ts` | AI interaction | Query input, response display, code integration |
| `CompilationOutputComponent` | `/components/compilation-output/compilation-output.component.ts` | Compilation results | Error/success display, formatting |

### Services

| Service | File Path | Purpose | Key Features |
|---------|-----------|---------|-------------|
| `ThemeService` | `/services/theme.service.ts` | Theme management | Toggle light/dark mode, theme persistence |
| `FileSystemService` | `/services/file-system.service.ts` | File operations | CRUD operations, active file tracking |
| `CompilationService` | `/services/compilation.service.ts` | Code compilation | Contract compilation, error handling |
| `AiService` | `/services/ai.service.ts` | AI integration | Query processing, response handling |

### Modules

| Module | Purpose | Key Imports |
|--------|---------|------------|
| `AppModule` | Main application module | Component declarations, service providers |
| `AppRoutingModule` | Application routing | Route definitions, navigation |
| Angular Material | UI component library | Buttons, dialogs, inputs, panels |
| `DragDropModule` | Resizable panels | Panel resizing functionality |
| `HighlightModule` | Code highlighting | Syntax highlighting for various languages |
| `BrowserAnimationsModule` | Animation support | Smooth transitions and effects |

---

## Data Flow & State Management

### Component Interaction

The BedrockIDE Angular implementation uses a combination of:

1. **Parent-Child Communication**:
   - `@Input()` for passing data down the component tree
   - `@Output()` and `EventEmitter` for passing events up

2. **Service-based State Management**:
   - Shared services maintain application state
   - Components subscribe to service observables

### Service Communication

| Service | State Management | Consumers |
|---------|-----------------|-----------|
| `FileSystemService` | `BehaviorSubject<FileNode[]>` for file tree<br>`BehaviorSubject<FileNode>` for active file | `CodeEditorComponent`<br>`FileExplorerComponent` |
| `ThemeService` | `BehaviorSubject<boolean>` for dark mode | `AppComponent`<br>`HeaderComponent`<br>`CodeEditorComponent` |
| `CompilationService` | Returns `Observable<CompilationResult>` | `CodeEditorComponent`<br>`CompilationOutputComponent` |
| `AiService` | Returns `Observable<AiResponse>` | `AiAssistantComponent`<br>`CodeEditorComponent` |

### RxJS Usage

- **Subscription Management**: Components implement `OnDestroy` and unsubscribe to prevent memory leaks
- **Async Pipe**: Used in templates to automatically subscribe/unsubscribe
- **Operators**: `map`, `tap`, `catchError`, etc. used for stream processing

---

## UI Elements & Features

### Editor Interface

| Feature | Implementation | Status |
|---------|---------------|--------|
| Monaco Editor | Integrated via direct import | Complete |
| Syntax Highlighting | Monaco language support | Complete for Solidity, JS, TS, etc. |
| Code Completion | Monaco completion providers | Basic support implemented |
| File Tree | Angular Material components | Complete |
| Resizable Panels | Angular CDK drag-drop | Complete |
| Split View | CSS Grid/Flexbox layout | Complete |
| Theme Support | Monaco theme configuration | Complete |

### AI Assistant

| Feature | Implementation | Status |
|---------|---------------|--------|
| Query Input | Angular form controls | Complete |
| Response Display | Formatted output | Complete |
| Code Insertion | Monaco editor integration | Complete |
| Temperature Setting | Slider control | Complete |
| Context Awareness | Current file/code context | Complete |
| Error Handling | Error messages/snackbar | Complete |

### File System

| Feature | Implementation | Status |
|---------|---------------|--------|
| File Tree | Recursive component | Complete |
| File Creation | Dialog/input | Complete |
| File Deletion | Confirmation dialog | Complete |
| File Selection | Click handling | Complete |
| File Content Storage | LocalStorage persistence | Complete |
| File Icons | Material icons by type | Complete |

### Compilation Output

| Feature | Implementation | Status |
|---------|---------------|--------|
| Error Display | Formatted errors | Complete |
| Warning Display | Highlighted warnings | Complete |
| Success Indication | Visual feedback | Complete |
| Copy to Clipboard | Button functionality | Complete |
| Clear Output | Button functionality | Complete |
| Output Formatting | Pre-formatted text | Complete |

---

## Theme System

### Light/Dark Mode

- **Implementation**: ThemeService with RxJS BehaviorSubject
- **Persistence**: LocalStorage
- **Toggle**: Material slide toggle in header

### CSS Variables

- **Root Variables**: Defined in themes.scss
- **Theme Classes**: .light-theme and .dark-theme
- **Structure**:
  - Base color definitions
  - Semantic color mapping
  - Component-specific variables

### Component Styling

- **Approach**: Component-scoped SCSS 
- **Theme Context**: :host-context() for theme-aware styling
- **Responsive Design**: Flexbox/Grid for layouts, media queries for breakpoints

---

## Integration Points

### Monaco Editor

- **Integration**: Direct import of monaco-editor package
- **Features**:
  - Language registration for Solidity
  - Theme synchronization with app theme
  - Code completion providers
  - Editor state preservation

### AI Service

- **Integration**: HttpClient for API communication
- **Features**:
  - Request payload formatting
  - Response parsing
  - Error handling
  - Code insertion integration

### Compilation Service

- **Integration**: HttpClient for API communication
- **Features**:
  - Compiler version selection
  - Optimization settings
  - Error formatting
  - Output processing

---

## Future Extensions

### Missing Features

- **Contract Deployment**: Functionality to deploy compiled contracts to networks
- **Network Selection**: UI for selecting target blockchain networks
- **Authentication**: User authentication and personalized workspaces
- **Version Control**: Git integration for code versioning
- **Testing Framework**: Unit/integration test runner for smart contracts

### Enhancement Opportunities

- **Performance Optimization**: OnPush change detection, lazy loading
- **Authentication Interceptors**: HTTP interceptors for secured API calls
- **Progressive Web App**: Service worker for offline capabilities
- **Collaborative Editing**: Real-time collaboration features
- **Mobile Responsiveness**: Enhanced mobile layout support
- **Plugin Architecture**: Extensibility through plugins
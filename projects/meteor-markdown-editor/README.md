# Meteor Markdown Editor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.x-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38b2ac.svg)](https://tailwindcss.com/)

An AI-enhanced Markdown editor with publishing and community features.

![Meteor Markdown Editor Screenshot](./screenshot.png)

## Features

### Core Features
- ✅ Modern split-pane Markdown editor with real-time preview
- ✅ Syntax highlighting for code blocks
- ✅ GitHub integration for saving/loading documents
- ✅ Diff viewer for version comparison

### AI Features
- ✅ Integrated AI capabilities using Transformers.js with distilGPT-2
- ✅ UI elements for AI interactions
- 🚧 Suggestions and autocomplete (coming soon)
- 🚧 Document summarization (coming soon)
- 🚧 Grammar and style checking (coming soon)
- 🚧 Content generation (coming soon)

### Publishing Features
- ✅ OAuth authentication for publishing platforms
- ✅ Publishing to multiple platforms (GitHub Pages, dev.to, Hashnode)
- 🚧 Metadata management for published content (coming soon)

## Getting Started

See [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed instructions.

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/meteor-markdown-editor.git
   cd meteor-markdown-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Visit [http://localhost:5173](http://localhost:5173)

## Architecture

Meteor Markdown Editor is built with a modern tech stack:

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Build Tool**: Vite
- **AI Integration**: Transformers.js with distilGPT-2
- **Backend**: Node.js (in development, see [backend-specification.md](./backend-specification.md))

## Roadmap

The project is actively under development with the following phases:

1. ✅ **Core Editor** - Foundation and basic functionality 
2. 🚧 **AI Features** - AI-powered suggestions, summarization, and grammar checking
3. 🚧 **Publishing Workflow** - Integration with publishing platforms
4. 🚧 **Community Features & Backend** - User authentication, content sharing, commenting
5. 🚧 **Editor Enhancements & Polish** - UI/UX improvements, file management, settings
6. 🚧 **Production Readiness** - Error handling, testing, performance, security, accessibility

See [project-overview.md](./project-overview.md) for detailed development status and roadmap.

## Documentation

- [Getting Started Guide](./GETTING_STARTED.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Contributing](./CONTRIBUTING.md)
- [License](./LICENSE)
- [Backend Specification](./backend-specification.md)
- [Project Overview](./project-overview.md)

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

Meteor Markdown Editor is open source software licensed under the [MIT license](./LICENSE).
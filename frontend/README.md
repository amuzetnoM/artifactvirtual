# ArtifactVirtual Frontend

This directory contains the frontend applications and documentation websites for ArtifactVirtual.

## Overview

The frontend components include:

- **celestial-chaos**: Documentation site built with Astro/Starlight
- **av-next**: Next.js application for interactive demonstrations

## Celestial Chaos Documentation Site

The [celestial-chaos](./celestial-chaos/) directory contains the main documentation site for ArtifactVirtual. It's built using [Astro](https://astro.build/) with the [Starlight](https://starlight.astro.build/) documentation theme.

### Content Structure

The documentation is organized into:

- **Journal**: Raw, unfiltered frameworks and thoughts
- **Manifesto**: A compass to navigate the uncharted territories of the self
- **Research Papers**: In-depth explorations of robotics, uncertainty, and intelligence
- **Reference**: Technical documentation and specifications

### Development

To start working on the documentation site:

```bash
cd celestial-chaos
npm install
npm run dev
```

This will start a local development server at `http://localhost:4321`.

### Building and Deployment

```bash
# Build the site
cd celestial-chaos
npm run build

# Preview the built site locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## AV Next Application

The [av-next](./av-next/) directory contains a Next.js application for interactive demonstrations of ArtifactVirtual capabilities.

### Features

- Interactive LLM demo interfaces
- Visualization of model quantization
- Knowledge library exploration
- Integration with MCP servers

### Development

To start working on the Next.js application:

```bash
cd av-next
npm install
npm run dev
```

This will start a local development server at `http://localhost:3000`.

## Integration with ArtifactVirtual

The frontend applications integrate with the core ArtifactVirtual components:

1. They demonstrate the capabilities of the AutoRound quantization system
2. They provide interactive interfaces to the Oracle CLI functionality
3. They visualize the knowledge foundations from the datasets
4. They connect to MCP servers for providing context to LLMs

## Contributing

### Documentation Contributions

To contribute to the documentation:

1. Create a new markdown file in the appropriate directory
2. Follow the frontmatter format of existing documents
3. Preview your changes locally
4. Submit a pull request

### Application Contributions

To contribute to the Next.js application:

1. Create a feature branch
2. Implement your changes
3. Add tests for new functionality
4. Submit a pull request

## Style Guide

### Design System

All frontend components follow a consistent design system:

- **Color Palette**: Dark mode-focused with high contrast accents
- **Typography**: Monospace for code, sans-serif for UI, serif for long-form content
- **UI Components**: Consistent spacing and interaction patterns

### Documentation Style

- Use clear, concise language
- Include code examples where applicable
- Organize content with headings and lists
- Add cross-references to related documentation
- Include visual aids when helpful

---

"ArtifactVirtual: Structured Knowledge Systems, AI Ecosystems, and Tools that Empower Creation."
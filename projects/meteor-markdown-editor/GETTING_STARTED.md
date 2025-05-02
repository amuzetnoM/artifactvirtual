# Getting Started with Meteor Markdown Editor

This guide will walk you through setting up and using Meteor Markdown Editor for both development and general usage purposes.

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **Git** (for cloning the repository)
- A modern web browser (Chrome, Firefox, Edge, Safari)

## Installation

### For Users

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/meteor-markdown-editor.git
   cd meteor-markdown-editor
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Application**
   ```bash
   npm run dev
   ```

4. **Access the Editor**
   
   Open your browser and navigate to [http://localhost:5173](http://localhost:5173)

### For Developers

1. **Fork and Clone the Repository**
   
   First, fork the repository on GitHub, then:
   ```bash
   git clone https://github.com/yourusername/meteor-markdown-editor.git
   cd meteor-markdown-editor
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests** (when available)
   ```bash
   npm test
   ```

## Environment Setup

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# GitHub API (for GitHub integration)
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback

# Other publishing platforms
VITE_DEVTO_API_KEY=your_devto_api_key
VITE_HASHNODE_API_KEY=your_hashnode_api_key
```

> **Note**: For development with GitHub integration, you'll need to create a GitHub OAuth App. Visit GitHub > Settings > Developer settings > OAuth Apps > New OAuth App.

### Editor Configuration

The project uses the following configuration files:

- `.eslintrc.js` - ESLint configuration for code linting
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build tool configuration
- `tailwind.config.js` - Tailwind CSS configuration

## Basic Usage

### Creating and Editing Documents

1. **Creating a New Document**
   - Click "New" in the top menu
   - Start writing in the markdown editor pane (left side)
   - Preview will update in real-time on the right

2. **Formatting Text**
   - Use markdown syntax for formatting
   - Use toolbar buttons for common formatting operations

3. **Code Blocks**
   - Use triple backticks (\`\`\`) for code blocks
   - Specify language after backticks for syntax highlighting: \`\`\`javascript

### Saving Documents

1. **Local Storage**
   - Documents are automatically saved to browser storage
   - Click "Save" to manually trigger a save

2. **GitHub Integration**
   - Click "Connect to GitHub" to authorize the app
   - Save to a repository or gist using "Save to GitHub"
   - Load existing markdown files from your repositories

### Using AI Features

1. **Text Suggestions**
   - Highlight text and right-click for AI suggestions
   - Select "AI > Suggest" from the context menu

2. **Document Summarization**
   - Click "AI > Summarize" from the main menu
   - View generated summary in the sidebar

3. **Grammar Check**
   - Click "AI > Check Grammar" to analyze your document
   - Review suggestions and apply changes as needed

### Publishing Content

1. **Publishing Setup**
   - Click "Publish" in the main menu
   - Connect to your preferred publishing platforms
   - Configure publication details (title, tags, etc.)

2. **Platforms**
   - GitHub Pages: Publish directly to your GitHub Pages
   - dev.to: Publish as a draft or published article
   - Hashnode: Publish to your Hashnode blog

## Advanced Features

### Custom Themes

1. To change the editor theme:
   - Go to "Settings > Appearance"
   - Select from available themes or customize your own

### Keyboard Shortcuts

- **Ctrl/Cmd + S**: Save document
- **Ctrl/Cmd + N**: New document
- **Ctrl/Cmd + P**: Preview mode toggle
- **Ctrl/Cmd + Shift + A**: AI suggestions
- **Ctrl/Cmd + B**: Bold text
- **Ctrl/Cmd + I**: Italic text
- **Ctrl/Cmd + K**: Insert link

## Troubleshooting

For common issues and their solutions, refer to [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## Next Steps

- Explore the [project roadmap](./project-overview.md) to see upcoming features
- Check out [CONTRIBUTING.md](./CONTRIBUTING.md) if you'd like to contribute
- Join our community discussions on GitHub Discussions

## Need Help?

- Open an issue on GitHub for bug reports or feature requests
- Check our documentation for more detailed guides
- Contact the maintainers for urgent matters
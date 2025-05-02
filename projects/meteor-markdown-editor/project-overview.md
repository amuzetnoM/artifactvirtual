# Meteor Markdown Editor – Project Overview

## 1. Project Goal

Create a fully open source, free, AI-enhanced Markdown editor with publishing and community features. The goal is to provide a seamless experience for writing, editing, and publishing Markdown documents, leveraging AI for suggestions, grammar checks, auto-editing, and content generation. The project aims to foster a Markdown writing community, enabling users to share and discover content easily. It will connect with major source control platforms (GitHub, GitLab, Bitbucket, etc.) for pulling/pushing Markdown files and allow publishing to platforms like dev.to and Hashnode.

## 2. Core Technologies

- **Framework/Library:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand

## 3. Current Status & Accomplished Tasks

Based on the project structure and dependencies (`package.json`, `vite.config.ts`, `tailwind.config.js`, `src/`):

- **Foundation:** Solid setup with Vite, React, TypeScript, and Tailwind CSS.
- **Core Editor:** Functional split-pane Markdown editor (`react-split`) with live preview (`react-markdown`, `remark-gfm`, `rehype-raw`) and syntax highlighting (`react-syntax-highlighter`).
- **State Management:** Zustand integrated for app state.
- **Code Structure:** Well-organized `src` directory (`components/`, `contexts/`, `services/`, `store/`, `types/`).
- **Potential GitHub Integration:** Presence of `@octokit/rest` for GitHub API interactions (e.g., loading/saving gists or repo files).
- **Diffing:** `diff` library included for version comparison features.

## 4. Remaining Tasks & Roadmap to Production

### Phase 1: Core AI Features

- [x] **LLM Integration:**
    - [x] Choose LLM provider(s) (OpenAI, Azure, local via Ollama, etc.) – Using Transformers.js with distilGPT-2.
    - [ ] Implement secure API key management.
    - [x] Create service layer for LLM API interaction.
- [ ] **AI Feature Implementation:**
    - [ ] **Suggestions/Autocomplete:** Inline code/text suggestions.
    - [ ] **Summarization:** Generate document summaries.
    - [ ] **Grammar/Style Check:** AI-powered proofreading.
    - [ ] **Content Generation:** Generate text from prompts.
- [x] **UI Integration:**
    - [x] Design and implement UI elements (buttons, context menus) for AI features.
    - [x] Display AI responses/suggestions within the editor.

### Phase 2: Publishing Workflow

- [x] **Define Targets:** Identify publishing platforms (e.g., GitHub Pages, dev.to, Hashnode, custom backend).
- [x] **Authentication:** Implement OAuth or token-based authentication for publishing.
- [x] **Publishing Logic:** Develop workflows to push Markdown/HTML to targets.
- [ ] **Metadata:** Allow users to manage metadata (title, tags, canonical URL).
- [ ] **UI:** Create a publishing modal or section.

### Phase 3: Community Features & Backend

- [ ] **Backend Service:**
    - [ ] Choose backend stack (Node.js, Python/Flask/Django, etc.).
    - [ ] Design and implement API endpoints (users, documents, comments).
- [ ] **Database:**
    - [ ] Choose database (PostgreSQL, MongoDB, etc.).
    - [ ] Design schema.
- [ ] **User Authentication:**
    - [ ] Secure registration and login (JWT, sessions).
    - [ ] Profile management.
- [ ] **Content Management:**
    - [ ] API endpoints for CRUD operations on user documents.
- [ ] **Sharing & Discovery:**
    - [ ] Public/private document settings.
    - [ ] Browse/search page for community content.
- [ ] **Interaction:**
    - [ ] Commenting system on published documents.
    - [ ] (Optional) Liking/voting features.

### Phase 4: Editor Enhancements & Polish

- [ ] **File Management:** Improve local file handling (open, save, create new).
- [ ] **Toolbar:** Enhance Markdown formatting toolbar.
- [ ] **Settings:** Add user preferences (theme, editor, AI settings).
- [ ] **Offline Support:** Basic offline functionality (Service Workers).
- [ ] **UI/UX Refinement:** Improve look, feel, and usability based on feedback.

### Phase 5: Production Readiness

- [ ] **Error Handling:** Robust error handling, logging, and user feedback.
- [ ] **Testing:**
    - [ ] Unit tests for components and utilities.
    - [ ] Integration tests for key workflows (AI, publishing, auth).
    - [ ] End-to-end tests for critical user paths.
- [ ] **Performance:**
    - [ ] Analyze bundle size, implement code splitting/lazy loading.
    - [ ] Optimize React rendering.
- [ ] **Security:**
    - [ ] Security review (XSS, CSRF, API key handling).
    - [ ] Add security headers.
- [ ] **Accessibility (a11y):** Audit and improve accessibility (WCAG).
- [ ] **CI/CD:** Set up continuous integration/deployment (e.g., GitHub Actions).
- [ ] **Documentation:**
    - [ ] User guides for editor, AI, publishing, and community features.
    - [ ] Developer docs (setup, architecture, API).
- [ ] **Cross-Browser Testing:** Ensure compatibility with major browsers.

## 5. Summary

The project has a strong foundation as a modern Markdown editor. The main gaps are in core AI enhancements, publishing workflow, and backend/community infrastructure. Significant work remains to realize the full vision of an AI-enhanced, community-driven Markdown editor and publisher.

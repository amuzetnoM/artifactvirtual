# Meteor Markdown Editor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.x-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38b2ac.svg)](https://tailwindcss.com/)

Meteor is a next-generation Markdown editor designed to unify writing, intelligence, collaboration, and publishing in one seamless experience. Lightweight, extensible, and infused with smart local AI, Meteor adapts to your flow—whether you're drafting articles, managing documentation, or collaborating in real time.


---

Vision

To empower creators, teams, and communities with a markdown-first workspace that understands context, adapts to style, and supports effortless publishing to the world.

Meteor is not just a writing tool—it’s an evolving platform for knowledge creation, augmentation, and distribution.


---

Key Features

Core Writing Experience

Modern split-pane editor with real-time preview

Rich Markdown syntax with code highlighting

GitHub integration for version control and remote storage

Diff viewer for tracking document changes

Offline-first with local document persistence


Lightweight AI Integration (Powered by Coedit)

Context-aware autocompletion

Inline grammar and style corrections

Smart summarization of long content

Creative prompt-based content generation

Local-first AI inference for privacy and speed


Publishing

OAuth-based publishing to platforms like GitHub Pages, dev.to, Hashnode, Medium

Multi-platform publishing from a single source

SEO metadata management (title, keywords, canonical URL)

OpenGraph previews and smart link cards


Collaboration & Community

Real-time sharing with public profiles and content hubs

Inline threaded comments with reactions

Roles and permissions: viewer, editor, admin

Activity feed and changelogs

Social integrations for cross-platform exposure



---

Architecture

Frontend

React + TypeScript for modern UI

Tailwind CSS for utility-first styling

Zustand for lightweight state management

Vite for instant development builds

Transformers.js + Coedit for AI interactions


Backend

Node.js + Express.js REST API

MongoDB for document, user, and version storage

JWT-based authentication with refresh token flow

AWS S3 (or MinIO) for image and file storage

Docker for containerization across environments



---

Schema Overview

Users

Manages user identity, social presence, and encrypted keys.

User {
  _id, username, email, displayName,
  avatarUrl, bio?, website?, socialLinks?,
  apiKeys?, createdAt, updatedAt, lastLoginAt?, isVerified
}

Documents

Richly formatted, versioned, and publishable Markdown files.

Document {
  _id, ownerId, title, content, tags[],
  isPublic, isPublished, slug?, metadata, collaborators[],
  createdAt, updatedAt, version
}

Versions

Tracks full history and diffs between edits.

Version {
  _id, documentId, userId, content,
  changes: { additions, deletions, summary? },
  createdAt, version
}

Comments

Inline and threaded feedback with reactions.

Comment {
  _id, documentId, userId, content,
  position?: { startLine, endLine }, parentId?,
  reactions[], createdAt, updatedAt?
}


---

API Routes

Authentication

POST /auth/register / POST /auth/login

GET /auth/me / PUT /auth/me

POST /auth/refresh-token


Documents

CRUD: /documents, /documents/:id

Versioning: /documents/:id/versions

Publishing: /documents/:id/publish


Collaborators

Add/remove/update collaborators via REST


Comments

Comment management with nested threading and reactions


AI Services (Coedit)

/ai/suggest - Predictive text suggestions

/ai/check-grammar - Grammar and style feedback

/ai/summarize - Condense long content

/ai/generate - Prompt-based text generation

/ai/analyze - Contextual insights



---

AI Engine: Coedit

Meteor uses Coedit, a compact AI engine tailored for local-first text operations:

Tiny transformer models with fast inference

On-device or server-deployable (via WebAssembly or lightweight Node)

Plugin interface to expand AI functions without heavy dependencies

Context-sensitive prompt chaining and style memory

AI sandboxing to prevent injection and misuse



---

Deployment Pipeline

Local Dev

Docker Compose stack: frontend + backend + MongoDB


Staging

Cloud containers (ECS or Kubernetes)

MongoDB Atlas or hosted alternative


Production

Autoscaling Kubernetes

CI/CD via GitHub Actions

HTTPS, CORS, rate limiting, full security suite



---

Security & Privacy

JWT authentication with refresh tokens

Role-based access across users and docs

Input validation and XSS/SQL injection protection

AI sandboxing + prompt history security

Fully encrypted API keys

Local-only AI inference for private documents



---

What’s Coming

Real-time multi-user editing with presence indicators

Publishing dashboard with analytics and engagement stats

Plugin SDK for custom commands, themes, and workflows

Whisper.js integration for voice-to-markdown

AI caching and incremental document embeddings



---

Closing Vision

Meteor is a unified space to write, think, evolve, and publish. It’s designed for privacy-respecting intelligence, team-ready workflows, and infinite extensibility. Whether you’re drafting alone or collaborating globally, Meteor keeps your content yours—and your creativity amplified.

A workspace that writes with you, not just for you.
Ready when you are.


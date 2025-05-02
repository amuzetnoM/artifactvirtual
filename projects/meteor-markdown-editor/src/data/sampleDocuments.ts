import { Document } from '../types';

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Generate sample documents
export const sampleDocuments: Document[] = [
  {
    id: generateId(),
    title: 'Getting Started with Markdown',
    content: `# Getting Started with Markdown

## Introduction

Markdown is a lightweight markup language with plain text formatting syntax. Its design allows it to be converted to many output formats, but the original tool by the same name only supports HTML.

## Basic Syntax

### Headers

# H1
## H2
### H3
#### H4
##### H5
###### H6

### Emphasis

*This text will be italic*
_This will also be italic_

**This text will be bold**
__This will also be bold__

_You **can** combine them_

### Lists

#### Unordered

* Item 1
* Item 2
  * Item 2a
  * Item 2b

#### Ordered

1. Item 1
2. Item 2
3. Item 3
   1. Item 3a
   2. Item 3b

### Images

![Alt Text](https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)

### Links

[GitHub](http://github.com)

### Blockquotes

> Markdown is a lightweight markup language with plain-text-formatting syntax, created in 2004 by John Gruber with Aaron Swartz.
>
> > Markdown is often used to format readme files, for writing messages in online discussion forums, and to create rich text using a plain text editor.

### Code Blocks

\`\`\`javascript
function fancyAlert(arg) {
  if(arg) {
    $.facebox({div:'#foo'})
  }
}
\`\`\`

### Tables

| Syntax | Description |
| ----------- | ----------- |
| Header | Title |
| Paragraph | Text |
`,
    tags: ['markdown', 'tutorial', 'beginner'],
    lastModified: new Date(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    title: 'Advanced Markdown Techniques',
    content: `# Advanced Markdown Techniques

## Extended Syntax

Markdown offers extended syntax for more complex formatting needs.

## Table of Contents

1. [Task Lists](#task-lists)
2. [Emoji](#emoji)
3. [Footnotes](#footnotes)
4. [Definition Lists](#definition-lists)
5. [Strikethrough](#strikethrough)

## Task Lists

- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

## Emoji

:smile: :heart: :thumbsup:

## Footnotes

Here's a sentence with a footnote. [^1]

[^1]: This is the footnote.

## Definition Lists

term
: definition

## Strikethrough

~~The world is flat.~~

## Highlight

==This text is highlighted.==

## Subscript/Superscript

H~2~O

X^2^

## Automatic URL Linking

https://www.example.com

## Custom HTML

<div class="custom-class">
  <p>This is a custom HTML block</p>
</div>
`,
    tags: ['markdown', 'advanced', 'syntax'],
    lastModified: new Date(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: generateId(),
    title: 'Project Documentation',
    content: `# Project Documentation

## Overview

This document provides a comprehensive overview of the project structure, features, and implementation details.

## Features

- **Feature 1**: Description of feature 1
- **Feature 2**: Description of feature 2
- **Feature 3**: Description of feature 3

## Implementation

\`\`\`typescript
// Sample code
interface User {
  id: string;
  name: string;
  email: string;
}

function getUsers(): User[] {
  // Implementation details
  return [];
}
\`\`\`

## Architecture

The system follows a modular architecture with the following components:

1. **Frontend**: React with TypeScript
2. **Backend**: Node.js with Express
3. **Database**: PostgreSQL

## Deployment

Deployment instructions go here.

## Future Work

- Implement feature X
- Optimize performance for Y
- Add support for Z
`,
    tags: ['project', 'documentation', 'technical'],
    lastModified: new Date(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];
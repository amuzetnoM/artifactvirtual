# Contributing to Meteor Markdown Editor

Thank you for considering contributing to Meteor Markdown Editor! This document provides guidelines and instructions for contributing to this project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project adheres to a Code of Conduct that sets expectations for participation in our community. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

We are committed to providing a friendly, safe, and welcoming environment for all, regardless of gender, sexual orientation, ability, ethnicity, socioeconomic status, and religion.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Git

### Setup for Development

1. **Fork the Repository**
   
   Start by forking the repository on GitHub.

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/meteor-markdown-editor.git
   cd meteor-markdown-editor
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/original-owner/meteor-markdown-editor.git
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a Branch**
   
   Create a new branch for each feature, bugfix, or enhancement:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   # or
   git checkout -b docs/documentation-change
   ```

2. **Make Your Changes**
   
   Write your code and ensure it follows the project's coding standards.

3. **Commit Changes**
   
   Use clear, descriptive commit messages:
   ```bash
   git add .
   git commit -m "feat: add autocomplete feature to editor"
   ```
   
   We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes that don't affect code behavior
   - `refactor:` for code refactoring
   - `test:` for adding or modifying tests
   - `chore:` for changes to the build process or auxiliary tools

4. **Stay Updated**
   
   Regularly sync your fork with the upstream repository:
   ```bash
   git fetch upstream
   git merge upstream/main
   ```

## Pull Request Process

1. **Update Your Branch**
   
   Before submitting a PR, ensure your branch is up to date with the main branch:
   ```bash
   git fetch upstream
   git merge upstream/main
   ```

2. **Push to Your Fork**
   ```bash
   git push origin your-branch-name
   ```

3. **Submit a Pull Request**
   
   - Go to your fork on GitHub and create a new Pull Request
   - Provide a clear title and description
   - Reference any related issues

4. **Code Review**
   
   - Maintainers will review your code
   - Address any requested changes
   - Be responsive to feedback

5. **Approval and Merge**
   
   Once approved, a maintainer will merge your PR.

## Coding Standards

### TypeScript/JavaScript

- Follow the ESLint configuration provided in the project
- Use TypeScript's strict mode and properly type all functions/variables
- Prefer functional programming patterns when appropriate
- Keep functions small and focused on a single responsibility

```typescript
// Good
function calculateTotal(items: Item[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}

// Avoid
function process(items: Item[]): void {
  // Function that does many different things
}
```

### React Components

- Use functional components with hooks instead of class components
- Keep components small and focused on a single responsibility
- Use proper prop typing with TypeScript

```tsx
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};
```

### CSS/Styling

- Follow the utility-first approach with Tailwind CSS
- Use consistent naming for custom CSS classes
- Avoid inline styles when possible

## Testing Guidelines

- Write tests for new features and bug fixes
- Aim for high test coverage of critical paths
- Tests should be in a `__tests__` directory adjacent to the code being tested

```typescript
// Example test for a utility function
import { calculateTotal } from '../utils/calculations';

describe('calculateTotal', () => {
  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });
  
  it('should sum all item prices', () => {
    const items = [
      { id: 1, name: 'Item 1', price: 10 },
      { id: 2, name: 'Item 2', price: 20 }
    ];
    expect(calculateTotal(items)).toBe(30);
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments to functions, classes, and interfaces
- Document complex algorithms and business logic
- Keep comments up to date with code changes

```typescript
/**
 * Calculates the total price of all items
 *
 * @param items - Array of items with price property
 * @returns The sum of all item prices
 */
function calculateTotal(items: Item[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}
```

### User Documentation

- Update README.md when adding major features
- Document new features in the appropriate guides
- Include screenshots or animations for UI changes

## Issue Reporting

### Bug Reports

When reporting a bug, please include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details (browser, OS, app version)

### Feature Requests

When requesting a feature, please include:

- A clear, descriptive title
- Detailed description of the feature
- Use cases and benefits
- Any alternatives you've considered
- Mockups or examples if applicable

## Feature Requests

We welcome feature requests! Please follow these guidelines:

1. Check if the feature has already been requested
2. Consider if the feature aligns with the project's goals
3. Provide as much detail as possible about your use case
4. If possible, suggest how this might be implemented

---

Thank you for contributing to Meteor Markdown Editor. Your efforts help make this project better for everyone!
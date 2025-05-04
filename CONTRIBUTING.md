# Contributing to ARTIFACT VIRTUAL

Thank you for your interest in contributing to ArtifactVirtual! This document provides guidelines and instructions to help you contribute effectively while protecting the project's integrity and quality.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Development Environment](#development-environment)
4. [Contribution Workflow](#contribution-workflow)
5. [Pull Request Guidelines](#pull-request-guidelines)
6. [Coding Standards](#coding-standards)
7. [Documentation Guidelines](#documentation-guidelines)
8. [Security Guidelines](#security-guidelines)
9. [License and Copyright](#license-and-copyright)
10. [Community Support](#community-support)

## INTRODUCTION
ARTIFACT VIRTUAL is an open-source project designed to provide a comprehensive framework for building AI applications. It includes advanced model quantization, local and cloud LLM integration, and a modular architecture for easy component reuse.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Read the [Getting Started](docs/gettingstarted.md) guide
- Installed all required dependencies
- Familiarized yourself with the project structure and architecture
- Checked existing [issues](https://github.com/amuzetnoM/artifactvirtual/issues) and [pull requests](https://github.com/amuzetnoM/artifactvirtual/pulls)

### Finding Issues to Work On

- Look for issues labeled `good-first-issue` for newcomers
- Check the project roadmap for planned features
- Propose new features or improvements via the issue tracker

## Development Environment

### Recommended Setup

We strongly recommend using our VS Code DevContainer for consistent development:

1. Install [Visual Studio Code](https://code.visualstudio.com/)
2. Install the [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
3. Clone the repository and open it in VS Code
4. When prompted, click "Reopen in Container"

This ensures you have all required tools, dependencies, and extensions pre-configured.

### Manual Setup

If DevContainer is not an option:

1. Set up your environment following the [Getting Started](docs/gettingstarted.md) guide
2. Run diagnostics to verify your setup:
   ```bash
   python utils/debugdiag/main.py project status
   ```

## Contribution Workflow

### 1. Fork and Clone

1. Fork the repository to your GitHub account
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/artifactvirtual.git
   cd artifactvirtual
   ```
3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/amuzetnoM/artifactvirtual.git
   ```

### 2. Create a Branch

Create a branch with a descriptive name:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-you-are-fixing
```

### 3. Implement Changes

Make your changes following the [Coding Standards](#coding-standards).

### 4. Test Your Changes

- Run relevant unit and integration tests
- For UI changes, test across multiple browsers/devices
- For API changes, test with multiple clients
- For LLM integration, test with different models and providers

### 5. Documentation

Update or create documentation for your changes:
- Code comments for complex logic
- Function/method documentation
- README updates if applicable
- Examples of usage
- Architecture diagrams for significant changes

### 6. Commit Guidelines

Follow these commit message guidelines:
- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests after the first line

Example:
```
Add AutoRound support for Intel GPUs

- Implement OneAPI backend for quantization
- Add unit tests for Intel GPU support
- Update documentation with Intel-specific examples

Fixes #123
```

### 7. Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a pull request against the `main` branch of the original repository
3. Fill in the pull request template completely
4. Request review from appropriate maintainers

## Pull Request Guidelines

### PR Checklist

Ensure your PR:
- [ ] Addresses a single concern (feature, bugfix, documentation)
- [ ] Includes appropriate tests and passes all CI checks
- [ ] Updates relevant documentation
- [ ] Includes screenshots/demos for visual changes
- [ ] References relevant issues
- [ ] Has been tested locally

### Review Process

1. At least one core maintainer must approve your PR
2. CI checks must pass
3. All requested changes must be addressed
4. Documentation must be updated
5. For significant changes, multiple approvals may be required

### After Merge

Once your PR is merged:
- You can delete your branch
- The change will be included in the next release
- You'll be credited for your contribution

## Coding Standards

### General Guidelines

- Write readable, self-explanatory code
- Follow the principle of least surprise
- Prioritize maintainability over cleverness
- Document complex algorithms and decisions
- Keep methods/functions focused on a single responsibility
- Use meaningful variable and function names

### Language-Specific Standards

#### Python
- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- Use type hints for all new code
- Write docstrings for all public functions
- Run `flake8` and `mypy` before submitting

#### TypeScript/JavaScript
- Follow the project's ESLint configuration
- Use TypeScript for all new code
- Prefer functional patterns where appropriate
- Document complex component props

#### Markdown
- Use semantically appropriate headers
- Include alt text for all images
- Follow a consistent structure

### Testing Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Maintain or improve test coverage
- Tests should be deterministic and fast

## Documentation Guidelines

### Code Documentation

- Document public APIs comprehensively
- Include examples for complex functions
- Explain "why" more than "what"
- Keep documentation close to the code

### Project Documentation

- Use Markdown for all documentation
- Place general guides in the `docs/` directory
- Include diagrams for complex systems
- Follow the established documentation structure

### Samples and Examples

- Provide complete, working examples
- Ensure examples work in isolation
- Include comments explaining key concepts
- Consider multiple skill levels

## Security Guidelines

### Sensitive Information

- Never commit API keys, passwords, or tokens
- Use environment variables for configuration
- Follow the principle of least privilege

### Data Protection

- Sanitize user inputs
- Validate data at system boundaries
- Be cautious with third-party dependencies
- Consider privacy implications of features

### Vulnerability Reporting

For security vulnerabilities:
- Do NOT create public issues
- Email security details to security@artifactvirtual.org
- Provide detailed reproduction steps
- Allow time for patches before disclosure

## License and Copyright

By contributing to ArtifactVirtual:

1. You agree that your contributions will be licensed under the project's [MIT License](LICENSE)
2. You confirm that you have the right to provide the contribution
3. You understand that your contribution will be publicly available

## Community Support

### Getting Help

- Join the [GitHub Discussions](https://github.com/amuzetnoM/artifactvirtual/discussions)
- Check the [Troubleshooting Guide](docs/troubleshooting.md)
- Review the [Resources](docs/resources.md) document

### Providing Help

- Answer questions in the discussion forums
- Review pull requests from other contributors
- Update documentation based on common questions
- Create cookbooks and samples for common scenarios

---

Thank you for contributing to ArtifactVirtual! Your efforts help build a more accessible and powerful AI development ecosystem for everyone.

> "ArtifactVirtual: Structured Knowledge Systems, AI Ecosystems, and Tools that Empower Creation."
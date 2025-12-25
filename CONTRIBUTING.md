# Contributing to DIMM

Thank you for your interest in contributing to DIMM! We welcome contributions from the community.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your changes
4. **Make your changes** with clear commit messages
5. **Test your changes** thoroughly
6. **Submit a pull request**

## Development Setup

### Prerequisites

- Rust 1.70.0 or higher
- Solana CLI 1.18.0 or higher
- Anchor 0.29.0 or higher
- Node.js 18.0.0 or higher
- pnpm (recommended)

### Setup Instructions

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/dimm.git
cd dimm

# Install dependencies
anchor build
cd sdk && pnpm install

# Run tests
anchor test
cd sdk && pnpm test
```

## Code Style

### Rust

- Follow standard Rust formatting: `cargo fmt`
- Use `cargo clippy` for linting
- Add documentation comments for public APIs
- Write tests for new functionality

### TypeScript

- Use ESLint configuration provided
- Format with Prettier
- Add JSDoc comments for public APIs
- Write unit tests for new features

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] Commit messages are clear and descriptive
- [ ] PR description explains the changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Code Review Process

1. Maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, PR will be merged
4. Your contribution will be acknowledged in release notes

## Reporting Bugs

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: 
- Rust version:
- Solana version:
- Anchor version:

## Additional Context
Any other relevant information
```

## Feature Requests

We welcome feature requests! Please:

1. Check if similar request exists
2. Clearly describe the feature
3. Explain use case and benefits
4. Consider implementation approach

## Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead, email security@dimm.ai with:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow code of conduct

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

- Open a discussion on GitHub
- Join our Discord (coming soon)
- Email team@dimm.ai

Thank you for contributing to DIMM! 🚀



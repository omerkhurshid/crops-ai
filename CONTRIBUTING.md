# Contributing to Crops.AI

Thank you for your interest in contributing to Crops.AI! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/crops-ai.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes following our coding standards
5. Commit your changes with clear messages
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## Development Setup

1. Install dependencies: `npm install`
2. Set up environment variables: `cp .env.example .env.local`
3. Run development server: `npm run dev`

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Maintain strict type safety
- Avoid using `any` type
- Document complex types with JSDoc comments

### Code Style
- Follow the existing code style
- Use Prettier for formatting
- Use ESLint for linting
- Keep functions small and focused

### Testing
- Write tests for new features
- Maintain test coverage above 85%
- Use descriptive test names
- Test edge cases
- Run the full test suite: `npm run test:all`
- Include unit, integration, and e2e tests as appropriate

### Git Commit Messages
- Use clear, descriptive commit messages
- Start with a verb in present tense
- Keep the first line under 72 characters
- Reference issue numbers when applicable

Example:
```
Add weather forecast API integration

- Integrate OpenWeatherMap API
- Add hyperlocal forecasting
- Implement caching layer

Closes #123
```

## Pull Request Process

1. Update documentation for any API changes
2. Add tests for new functionality
3. Ensure all tests pass: `npm run test:all`
4. Run type checking: `npm run type-check`
5. Run linting: `npm run lint`
6. Run security checks: `npm run security:all`
7. Run performance tests: `npm run perf:test`
8. Update the README.md if needed
9. Request review from maintainers

### Quality Gates

All pull requests must pass the following automated checks:
- ✅ All tests passing (unit, integration, e2e)
- ✅ Type checking without errors
- ✅ Linting without errors
- ✅ Security scan without critical issues
- ✅ Performance tests within thresholds
- ✅ Code coverage above 85%

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Search existing issues before creating a new one
- Provide clear reproduction steps for bugs
- Include relevant system information

## Questions?

Feel free to reach out through GitHub Issues for any questions about contributing.
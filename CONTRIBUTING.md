# Contributing to FC Barcelona Match Schedule

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 21.0.0)
- npm
- Git
- A football-data.org API key

### Setup

For a streamlined setup, you can use the provided setup script:

```bash
./setup.sh
```

This script will:

- Check Node.js version
- Install dependencies
- Set up git hooks
- Create a `.env` file from `.env.example` (if it doesn't exist)
- Run initial code quality checks and a test build

Alternatively, you can follow the manual steps below:

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env` and add your API key
5. Start development: `npm run netlify-dev`

## 📝 Development Workflow

### Code Quality Standards

This project enforces strict code quality standards:

- **ESLint**: All JavaScript files must pass linting
- **Prettier**: All files must be properly formatted
- **TypeScript**: All TypeScript files must compile without errors
- **Git Hooks**: Pre-commit hooks automatically format and lint staged files

### Before Making Changes

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make sure all quality checks pass:
   ```bash
   npm run lint        # Check for linting errors
   npm run type-check  # Check TypeScript
   npm run format      # Format all files
   ```

### Making Changes

1. Write clean, readable code following project conventions
2. Add TypeScript types for new components/functions
3. Update documentation if needed
4. Test your changes locally

### Code Style

- Use TypeScript for new React components
- Use ES6+ features where appropriate
- Follow the existing code structure and naming conventions
- Console statements are allowed in Netlify functions but avoid them in frontend code

## 🧪 Testing

### Manual Testing

- Test your changes in development mode: `npm run netlify-dev`
- Verify the application builds: `npm run build`
- Test in production mode: `npm run preview`

### Automated Checks

All code must pass automated quality checks:

```bash
npm run lint          # ESLint checks
npm run format:check  # Prettier formatting
npm run type-check    # TypeScript compilation
```

## 📤 Submitting Changes

### Pull Request Process

1. Ensure all quality checks pass locally
2. Push your branch to your fork
3. Create a pull request with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Screenshots if UI changes are involved
   - Reference any related issues

### Pull Request Requirements

- [ ] All automated CI checks must pass
- [ ] Code follows project style guidelines
- [ ] No linting or formatting errors
- [ ] TypeScript compiles without errors
- [ ] Changes are well-documented

### Review Process

- Pull requests require review before merging
- CI/CD pipeline must pass all checks
- Maintainers may request changes or clarifications

## 🗂️ Project Structure

```
/
├── src/                    # React frontend source code
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── *.css              # Styling files
├── netlify/functions/      # Serverless backend functions
│   ├── getStandings.js    # Get team standings
│   ├── matches.js         # Get match data
│   └── utils/             # Shared utilities
├── .github/workflows/      # CI/CD configuration
├── .vscode/               # VSCode settings
└── public/                # Static assets
```

## 🐛 Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Console errors (if any)

## 💡 Feature Requests

For new features:

- Describe the feature and its benefits
- Explain how it fits with existing functionality
- Consider implementation complexity
- Discuss any potential breaking changes

## 📋 Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or improvement
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed

## 🔧 Development Tips

### VSCode Setup

Install recommended extensions for the best development experience:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features

### Common Commands

```bash
npm run dev              # Start Vite dev server
npm run netlify-dev      # Start with Netlify functions
npm run build            # Build for production
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format all files
```

### Debugging

- Use browser developer tools for frontend debugging
- Check Netlify function logs for backend issues
- Use `console.log` in Netlify functions (allowed by ESLint config)

## 📞 Getting Help

- Check existing issues for similar problems
- Review the code quality documentation
- Ask questions in pull request discussions
- Follow the project's code style and conventions

Thank you for contributing! 🎉

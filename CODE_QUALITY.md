# Code Quality Setup

This project has comprehensive code quality tools configured to ensure consistent code formatting and best practices.

## Tools Configured

### 🔧 Development Tools

- **ESLint**: Linting for JavaScript files with React-specific rules
- **Prettier**: Code formatting for consistent style
- **TypeScript**: Type checking for TypeScript files
- **Husky**: Git hooks for automated quality checks
- **lint-staged**: Run linters on staged files only

### 📋 Available Scripts

```bash
# Linting
npm run lint              # Check JavaScript files for issues
npm run lint:fix          # Auto-fix JavaScript linting issues

# Formatting
npm run format            # Format all files with Prettier
npm run format:check      # Check if files are properly formatted

# Type Checking
npm run type-check        # Run TypeScript compiler without emitting files

# Pre-commit
npm run pre-commit        # Run lint-staged (automatically run by git hooks)
```

### 🚀 Git Hooks

The project uses Husky to automatically run code quality checks:

- **Pre-commit**: Automatically formats and lints staged files before commit
- Files are checked and formatted according to project standards
- Prevents commits with formatting or linting issues

### 🎯 VSCode Integration

The project includes VSCode configuration for optimal development experience:

- **Auto-format on save**: Files are automatically formatted when saved
- **ESLint integration**: Linting errors shown in real-time
- **Recommended extensions**: Automatically suggests useful extensions

### 🔄 GitHub Actions

Automated CI/CD pipeline runs on every push and pull request:

- **Code quality checks**: ESLint, Prettier, and TypeScript checks
- **Build verification**: Ensures project builds successfully
- **Multi-node testing**: Tests on Node.js 18.x and 20.x
- **Automatic deployment**: Deploys to Netlify on main branch

### 📝 Configuration Files

- `.eslintrc.cjs` - ESLint configuration
- `.prettierrc.json` - Prettier formatting rules
- `.prettierignore` - Files to ignore during formatting
- `.vscode/settings.json` - VSCode editor settings
- `.vscode/extensions.json` - Recommended VSCode extensions
- `.github/workflows/` - GitHub Actions workflows

### 🛠️ Setup Instructions

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Initialize git hooks**:

   ```bash
   npm run prepare
   ```

3. **Format existing code**:

   ```bash
   npm run format
   ```

4. **Check for issues**:
   ```bash
   npm run lint
   npm run type-check
   ```

### 📊 Code Quality Rules

#### ESLint Rules

- No unused variables (with underscore prefix exception)
- Prefer const over let/var
- No console statements in frontend code (allowed in Netlify functions)
- React-specific best practices

#### Prettier Rules

- Single quotes for strings
- Semicolons required
- 2-space indentation
- 80-character line width
- Trailing commas in ES5

#### TypeScript Rules

- Strict type checking enabled
- No unused locals/parameters
- No fallthrough cases in switch statements

### 🚫 Pre-commit Prevention

The following will prevent commits:

- Linting errors in JavaScript files
- Formatting issues in any supported file
- TypeScript compilation errors (in CI)

### 💡 Tips

- Use `npm run lint:fix` to automatically fix many linting issues
- Use `npm run format` to format all files at once
- Install recommended VSCode extensions for the best experience
- The pre-commit hook will automatically format staged files

### 🔧 Netlify Functions

Console statements are allowed in Netlify functions for debugging purposes. All other code quality rules still apply.

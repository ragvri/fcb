#!/bin/bash

# FC Barcelona Project Setup Script
# This script sets up the development environment for the project

echo "🔧 Setting up FC Barcelona Match Schedule project..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 21.0.0 (as per package.json)"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_MAJOR_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR_VERSION" -lt 21 ]; then
    echo "❌ Node.js version is too old. Your \`package.json\` requires Node.js >= 21.0.0"
    echo "   Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Set up git hooks
echo ""
echo "🔗 Setting up git hooks..."
npm run prepare

if [ $? -ne 0 ]; then
    echo "❌ Failed to set up git hooks"
    exit 1
fi

echo "✅ Git hooks configured"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env file created from .env.example"
        echo "⚠️  Please add your football-data.org API key to the .env file"
    else
        echo "⚠️  .env.example not found. Cannot create .env automatically."
        echo "   Please create .env manually or ensure .env.example exists."
    fi
else
    echo ""
    echo "✅ .env file already exists"
fi

# Run code quality checks
echo ""
echo "🔍 Running code quality checks..."

echo "  - Formatting code..."
npm run format

echo "  - Checking linting..."
npm run lint

if [ $? -ne 0 ]; then
    echo "❌ Linting failed"
    exit 1
fi

echo "  - Checking TypeScript..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ TypeScript check failed"
    exit 1
fi

echo "✅ All code quality checks passed"

# Test build
echo ""
echo "🏗️  Testing build process..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Final instructions
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Add your football-data.org API key to the .env file"
echo "  2. Start development server: npm run netlify-dev"
echo "  3. Visit http://localhost:8888"
echo ""
echo "📚 Available commands:"
echo "  npm run dev              # Start Vite dev server"
echo "  npm run netlify-dev      # Start with Netlify functions"
echo "  npm run build            # Build for production"
echo "  npm run lint             # Check code quality"
echo "  npm run format           # Format code"
echo "  npm run type-check       # Check TypeScript"
echo ""
echo "📖 Documentation:"
echo "  - README.md              # Project overview"
echo "  - CODE_QUALITY.md        # Code quality standards"
echo "  - CONTRIBUTING.md        # Contribution guidelines"
echo ""
echo "Happy coding! 🚀"

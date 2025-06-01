# FC Barcelona Match Schedule with VIBE CODING

A React application that displays FC Barcelona's upcoming matches using data from the [football-data.org](https://www.football-data.org/) API. The application is built with React, TypeScript, and Vite, and is deployed on Netlify with serverless functions.

## 🌐 Live Demo

Visit the live application at: [https://ragvri-fcb.netlify.app](https://ragvri-fcb.netlify.app)

## ✨ Features

- Display upcoming FC Barcelona matches
- Show match details including:
  - Competition name
  - Match date and time
  - Home and away teams
  - Match stage
  - Match status
- Responsive design for all device sizes
- Secure API key handling using Netlify Functions

## 🛠️ Tech Stack

- **Frontend:**
  - React
  - TypeScript
  - Vite
  - CSS3
- **Backend:**
  - Netlify Functions (Serverless)
- **API:**
  - [football-data.org](https://www.football-data.org/) API
- **Code Quality:**
  - ESLint for linting
  - Prettier for code formatting
  - Husky for git hooks
  - lint-staged for pre-commit checks
  - GitHub Actions for CI/CD

## 📋 Code Quality

This project maintains high code quality standards with automated formatting and linting. See [CODE_QUALITY.md](./CODE_QUALITY.md) for detailed information about:

- Available scripts for linting and formatting
- Git hooks for automated quality checks
- GitHub Actions CI/CD pipeline
- VSCode integration and recommended extensions
- Code style rules and conventions

**Quick commands:**

```bash
npm run lint          # Check code quality
npm run format        # Format all files
npm run type-check    # TypeScript checking
```

## 🚀 Local Development

### Prerequisites

- Node.js (version >= 21.0.0)
- npm
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
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

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd fcb
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```

4. Add your football-data.org API key to the `.env` file:

   ```
   VITE_FOOTBALL_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run netlify-dev
   ```

The application will be available at `http://localhost:8888`.

## 📦 Build

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🚀 Deployment

This project is configured for deployment on Netlify. To deploy:

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Configure the environment variable `VITE_FOOTBALL_API_KEY` in Netlify's dashboard
4. Deploy!

## 📝 Environment Variables

- `VITE_FOOTBALL_API_KEY`: Your football-data.org API key

## 🤝 Contributing

For detailed information on how to contribute to this project, please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC

## 👏 Acknowledgments

- [football-data.org](https://www.football-data.org/) for providing the API
- [Netlify](https://www.netlify.com/) for hosting and serverless functions
- [Vite](https://vitejs.dev/) for the build tooling

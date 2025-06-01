module.exports = {
	root: true,
	env: {
		browser: true,
		es2020: true, // Kept es2020, can be es2021 or latest if preferred
		node: true
	},
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:react/jsx-runtime', // Ensures React 17+ JSX transform compatibility
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended' // Added for Prettier integration, should be last
	],
	ignorePatterns: ['dist', '.vscode/', '.eslintrc.cjs'], // Added .vscode
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true
		},
		project: ['./tsconfig.json'] // Main tsconfig for src files
	},
	plugins: [
		'react-refresh',
		'react', // Already present
		'react-hooks', // Already present
		'@typescript-eslint' // Already present
	],
	settings: {
		react: {
			version: 'detect'
		}
	},
	rules: {
		'react-refresh/only-export-components': [
			'warn',
			{ allowConstantExport: true },
		],
		'react/prop-types': 'off',
		'react/react-in-jsx-scope': 'off',
		'no-console': 'off', // Changed from 'warn' to 'off'
		'prefer-const': 'error',
		'no-var': 'error',
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Changed from no-unused-vars
		'@typescript-eslint/no-explicit-any': 'warn', // Added from previous .eslintrc.json
		'react/no-unescaped-entities': 'warn' // Added from previous .eslintrc.json
	},
	overrides: [
		{
			// Specific override for vite.config.ts
			files: ['vite.config.ts'],
			parserOptions: {
				project: ['./tsconfig.node.json'] // Use tsconfig.node.json for Vite config
			},
			rules: {
				'@typescript-eslint/no-var-requires': 'off' // Allow require if needed in Vite config
			}
		},
		{
			files: ['netlify/functions/**/*.js'],
			rules: {
				'no-console': 'off', // Allow console.log in Netlify functions
				'@typescript-eslint/no-var-requires': 'off' // Allow require in Netlify JS functions
			}
		}
	]
};

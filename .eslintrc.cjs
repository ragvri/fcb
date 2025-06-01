module.exports = {
	root: true,
	env: {
		browser: true,
		es2020: true,
		node: true
	},
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:react/jsx-runtime',
		'plugin:@typescript-eslint/recommended'
	],
	ignorePatterns: ['dist', '.eslintrc.cjs'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true
		},
		project: './tsconfig.json'
	},
	plugins: [
		'react-refresh',
		'react',
		'react-hooks',
		'@typescript-eslint'
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
		'no-console': 'off',
		'prefer-const': 'error',
		'no-var': 'error',
		'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
	},
	overrides: [
		{
			files: ['netlify/functions/**/*.js'],
			rules: {
				'no-console': 'off' // Allow console.log in Netlify functions
			}
		}
	]
}

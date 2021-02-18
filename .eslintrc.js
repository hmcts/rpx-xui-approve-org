module.exports = {
	root: false,
	env: { browser: true, es6: true, node: true },
	extends: [
		'plugin:@angular-eslint/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'prettier/@typescript-eslint',
	],

	parserOptions: { project: ['./tsconfig.eslint.json'], tsconfigRootDir: __dirname, sourceType: 'module' },
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier'],
	rules: {
		'prettier/prettier': 'error',

		'lines-between-class-members': 'off',
		'no-useless-constructor': 'off',
		'import/prefer-default-export': 'off',
		'implicit-arrow-linebreak': 'off',
		'object-curly-newline': [
			'off',
			{
				ObjectExpression: 'never',
				ObjectPattern: { multiline: true },
				ImportDeclaration: 'always',
				ExportDeclaration: { multiline: true, minProperties: 3 },
			},
		],
		'function-paren-newline': 'off',

		'@typescript-eslint/no-unsafe-call': 'warn',
		'@typescript-eslint/no-bound-method': 'off',
		'@typescript-eslint/no-useless-constructor': ['warn'],
		'@typescript-eslint/no-unsafe-assignment': 'warn',
		'@typescript-eslint/no-unsafe-member-access': 'warn',
		'@typescript-eslint/no-inferrable-types': 'warn',
		'@typescript-eslint/no-floating-promises': 'off',
		'@typescript-eslint/no-misused-promises': ['off', { checksConditionals: false }],

		'@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
	},
};

module.exports = {
	parserOptions: {
		project: ['./tsconfig.eslint.json'],
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},
	rules: {
		'import/no-extraneous-dependencies': 'off',
	},
}

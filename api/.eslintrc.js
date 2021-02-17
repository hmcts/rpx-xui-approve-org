module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier/@typescript-eslint',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', '@typescript-eslint/tslint'],
    rules: {
        'lines-between-class-members': 'off',
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
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-misused-promises': [
            'off',
            {
                checksConditionals: false,
            },
        ],
        'function-paren-newline': 'off',
    },
}

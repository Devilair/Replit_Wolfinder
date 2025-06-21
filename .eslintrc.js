module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    // Prevent future code monsters
    'max-lines-per-file': ['error', { max: 800, skipBlankLines: true, skipComments: true }],
    
    // Clean code enforcement
    'no-unused-vars': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // Performance and best practices
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    
    // Type safety
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'error',
    
    // Code organization
    'import/order': 'off', // Would require additional plugin
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    
    // Prevent problematic patterns
    'no-duplicate-imports': 'error',
    'no-unreachable': 'error',
    'no-unused-expressions': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.js', // Ignore compiled JS files
    'vite.config.ts', // Don't lint build config
    'tailwind.config.ts',
    'postcss.config.js'
  ],
  overrides: [
    {
      files: ['*.test.ts', '*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests for mocking
        'max-lines-per-file': ['error', { max: 1000 }], // Slightly more lenient for tests
      },
    },
  ],
};
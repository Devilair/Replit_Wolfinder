// Simple ESLint configuration to prevent code monsters
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Prevent future code monsters
    'max-lines-per-file': ['error', { max: 800, skipBlankLines: true, skipComments: true }],
    
    // Clean code enforcement
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    
    // Prevent problematic patterns
    'no-duplicate-imports': 'error',
    'no-unreachable': 'error',
    'no-unused-expressions': 'error'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'vite.config.ts',
    'tailwind.config.ts',
    'postcss.config.js'
  ]
};
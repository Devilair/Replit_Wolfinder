import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    rules: {
      // Prevent future code monsters
      'max-lines': ['error', { max: 800, skipBlankLines: true, skipComments: true }],
      
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
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly'
      }
    }
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'vite.config.ts',
      'tailwind.config.ts', 
      'postcss.config.js'
    ]
  }
];
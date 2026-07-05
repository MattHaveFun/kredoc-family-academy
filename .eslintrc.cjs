module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Honor the codebase's leading-underscore convention for intentionally
    // unused vars/args (e.g. the hooks' _priority and marketStore's want*
    // compatibility parameters).
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
    ],
  },
  overrides: [
    {
      // Context modules intentionally co-locate their provider with its hook
      // and shared constants — a standard pattern worth more than fast-refresh
      // purity in these two files.
      files: ['src/context/**/*.tsx'],
      rules: { 'react-refresh/only-export-components': 'off' },
    },
  ],
}

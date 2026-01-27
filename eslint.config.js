import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  { ignores: ['dist'] },

  // --- 1. FRONT-END CONFIG (React/Browser) ---
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        // Assuming your backend files are NOT in the same path as your front end
        // If your frontend uses common features like __app_id, you can add them here:
        // __app_id: 'readonly',
        // __firebase_config: 'readonly',
        // __initial_auth_token: 'readonly'
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // --- 2. BACK-END CONFIG (Node.js/CommonJS) ---
  {
    // Targets all JavaScript files within the 'back-end' directory
    files: ['back-end/**/*.js'],
    languageOptions: {
      // Sets the Node.js environment which defines 'require', 'module', 'exports', etc.
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs', // Node.js typically uses CommonJS modules
      },
    },
    // We only need the base recommended rules for Node.js files
    rules: {
      ...js.configs.recommended.rules,
      // You can disable front-end specific rules here if they cause conflict
    },
  },
];
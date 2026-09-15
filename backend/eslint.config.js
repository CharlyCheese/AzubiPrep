// ESLint-Konfiguration fürs Backend (siehe docs/agent-briefs/OPS-005-backend-code-cleanup.md).
// Bewusst schlank gehalten: kein zusätzliches Framework-Plugin, nur die
// eingebauten "recommended"-Regeln + Node-Globals – reicht, um bei einem
// Review (eigenes, durch Kommilitonen oder den Dozenten) offensichtliche
// Fehler (ungenutzte Variablen, doppelte Deklarationen etc.) automatisch
// zu finden. Aufruf: npm run lint (im backend-Ordner).
import js from '@eslint/js';

export default [
  { ignores: ['node_modules/**'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      // Ungenutzte Variablen sind ein Warnhinweis, kein harter Fehler –
      // Express-Handler wie (req, res) mit ungenutztem req sollen nicht
      // rot anschlagen (args: 'after-used' erlaubt das automatisch).
      // Mit "_" prefixte Parameter (z. B. Express-Error-Handler, die zwingend
      // 4 Parameter brauchen: (err, req, res, _next)) sind bewusst ungenutzt.
      'no-unused-vars': ['warn', { args: 'after-used', argsIgnorePattern: '^_', ignoreRestSiblings: true }],
    },
  },
];

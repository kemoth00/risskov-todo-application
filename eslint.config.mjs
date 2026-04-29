// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt()
  .override('nuxt/vue/rules', {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing': ['warn', { html: { void: 'always' } }],
    },
  })
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      semi: ['error', 'always'],
    },
  });

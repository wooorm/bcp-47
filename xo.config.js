/**
 * @import {FlatXoConfig} from 'xo'
 */

/** @type {FlatXoConfig} */
const xoConfig = [
  {
    name: 'default',
    prettier: 'compat',
    rules: {
      curly: 'off',
      'jsdoc/check-indentation': 'off',
      'jsdoc/check-line-alignment': 'off',
      'jsdoc/require-asterisk-prefix': 'off',
      'node-test/no-conditional-assertion': 'off',
      'node-test/no-import-test-files': 'off',
      'node-test/prefer-test-context-assert': 'off',
      'prefer-arrow-callback': 'off',
      'require-unicode-regexp': 'off',
      'unicorn/no-useless-recursion': 'off',
      'unicorn/prefer-code-point': 'off',
      'unicorn/prefer-simple-condition-first': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/single-line-block-comment-style': 'off'
    },
    space: true
  },
  {
    files: ['package.json'],
    rules: {
      'package-json/consistent-path-prefix': 'off',
      'package-json/prefer-exports': 'off',
      'package-json/require-engines': 'off',
      'package-json/sort-files': 'off',
      'package-json/sort-properties': 'off',
      'package-json/valid-fields': 'off'
    }
  }
]

export default xoConfig

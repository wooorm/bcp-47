/**
 * @import {Warning} from '../index.js'
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {parse} from '../index.js'

test('parse', async function (t) {
  await t.test('should be a function', async function () {
    assert.equal(typeof parse, 'function')
  })

  await t.test('should throw without `tag`', async function () {
    assert.throws(function () {
      // @ts-expect-error: `tag` missing.
      parse()
    }, /Expected string, got `undefined`/)
  })

  await t.test('should throw with `tag: null`', async function () {
    assert.throws(function () {
      // @ts-expect-error: `tag` incorrect.
      parse(null)
    }, /Expected string, got `null`/)
  })

  await t.test('should coerce to a string', async function () {
    assert.deepEqual(
      // @ts-expect-error: `tag` incorrect.
      parse({toString}),
      parse('en')
    )

    /**
     * Turn into a string.
     *
     * @returns {string}
     *   Tag.
     */
    function toString() {
      return 'en'
    }
  })

  await t.test('should normalize when possible', async function () {
    assert.deepEqual(parse('i-klingon'), {
      language: 'tlh',
      extendedLanguageSubtags: [],
      script: null,
      region: null,
      variants: [],
      extensions: [],
      privateuse: [],
      irregular: null,
      regular: null
    })
  })

  await t.test(
    'should not normalize when `normalize: false`',
    async function () {
      assert.deepEqual(parse('i-klingon', {normalize: false}), {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: 'i-klingon',
        regular: null
      })
    }
  )

  await t.test(
    'should return an irregular when not normalizable',
    async function () {
      assert.deepEqual(parse('i-default'), {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: 'i-default',
        regular: null
      })
    }
  )

  await t.test(
    'should return a regular when not normalizable',
    async function () {
      assert.deepEqual(parse('zh-min'), {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: 'zh-min'
      })
    }
  )

  await t.test(
    'should return an empty schema for a too long variant',
    async function () {
      assert.deepEqual(parse('en-GB-abcdefghi'), {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      })
    }
  )

  await t.test('should warn for a too long variant', async function () {
    /** @type {Array<Parameters<Warning>>} */
    const warnings = []

    parse('en-GB-abcdefghi', {warning})

    assert.deepEqual(warnings, [
      ['Too long variant, expected at most 8 characters', 1, 14]
    ])

    /**
     * Collect the warning.
     *
     * @type {Warning}
     */
    function warning(...parameters) {
      warnings.push(parameters)
    }
  })

  await t.test(
    'should return values up to a too long variant when `forgiving: true`',
    async function () {
      assert.deepEqual(parse('en-GB-abcdefghi', {forgiving: true}), {
        language: 'en',
        extendedLanguageSubtags: [],
        script: null,
        region: 'GB',
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      })
    }
  )

  await t.test(
    'should return an empty schema for too many extended language subtags',
    async function () {
      assert.deepEqual(parse('aa-bbb-ccc-ddd-eee'), {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      })
    }
  )

  await t.test(
    'should warn for too many extended language subtags',
    async function () {
      /** @type {Array<Parameters<Warning>>} */
      const warnings = []

      parse('aa-bbb-ccc-ddd-eee', {warning})

      assert.deepEqual(warnings, [
        [
          'Too many extended language subtags, expected at most 3 subtags',
          3,
          14
        ]
      ])

      /**
       * Collect the warning.
       *
       * @type {Warning}
       */
      function warning(...parameters) {
        warnings.push(parameters)
      }
    }
  )

  await t.test(
    'should return values up to too many extended language subtags when `forgiving: true`',
    async function () {
      assert.deepEqual(parse('aa-bbb-ccc-ddd-eee', {forgiving: true}), {
        language: 'aa',
        extendedLanguageSubtags: ['bbb', 'ccc', 'ddd'],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      })
    }
  )

  await t.test(
    'should return an empty schema for a too long extension',
    async function () {
      assert.deepEqual(parse('en-i-abcdefghi'), {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      })
    }
  )

  await t.test('should warn for a too long extension', async function () {
    /** @type {Array<Parameters<Warning>>} */
    const warnings = []

    parse('en-i-abcdefghi', {warning})

    assert.deepEqual(warnings, [
      ['Too long extension, expected at most 8 characters', 2, 13]
    ])

    /**
     * Collect the warning.
     *
     * @type {Warning}
     */
    function warning(...parameters) {
      warnings.push(parameters)
    }
  })

  await t.test(
    'should return values up to a too long extension when `forgiving: true`',
    async function () {
      assert.deepEqual(parse('en-i-abcdefghi', {forgiving: true}), {
        language: 'en',
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      })
    }
  )

  await t.test(
    'should return an empty schema for an empty extension',
    async function () {
      assert.deepEqual(parse('en-i-a'), {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      })
    }
  )

  await t.test('should warn for an empty extension', async function () {
    /** @type {Array<Parameters<Warning>>} */
    const warnings = []

    parse('en-i-a', {warning})

    assert.deepEqual(warnings, [
      [
        'Empty extension, extensions must have at least 2 characters of content',
        4,
        4
      ]
    ])

    /**
     * Collect the warning.
     *
     * @type {Warning}
     */
    function warning(...parameters) {
      warnings.push(parameters)
    }
  })

  await t.test(
    'should return values up to an empty extension when `forgiving: true`',
    async function () {
      assert.deepEqual(parse('en-i-a', {forgiving: true}), {
        language: 'en',
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      })
    }
  )

  await t.test(
    'should return an empty schema for a too long private-use area',
    async function () {
      assert.deepEqual(parse('en-x-abcdefghi'), {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      })
    }
  )

  await t.test(
    'should warn for a too long private-use area',
    async function () {
      /** @type {Array<Parameters<Warning>>} */
      const warnings = []

      parse('en-x-abcdefghi', {warning})

      assert.deepEqual(warnings, [
        ['Too long private-use area, expected at most 8 characters', 5, 13]
      ])

      /**
       * Collect the warning.
       *
       * @type {Warning}
       */
      function warning(...parameters) {
        warnings.push(parameters)
      }
    }
  )

  await t.test(
    'should return values up to a too long private-use area when `forgiving: true`',
    async function () {
      assert.deepEqual(parse('en-x-abcdefghi', {forgiving: true}), {
        language: 'en',
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      })
    }
  )

  await t.test(
    'should return an empty schema for superfluous content',
    async function () {
      assert.deepEqual(parse('abcdefghijklmnopqrstuvwxyz'), {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      })
    }
  )

  await t.test('should warn for superfluous content', async function () {
    /** @type {Array<Parameters<Warning>>} */
    const warnings = []

    parse('abcdefghijklmnopqrstuvwxyz', {warning})

    assert.deepEqual(warnings, [['Found superfluous content after tag', 6, 0]])

    /**
     * Collect the warning.
     *
     * @type {Warning}
     */
    function warning(...parameters) {
      warnings.push(parameters)
    }
  })

  await t.test(
    'should return values up to superfluous content when `forgiving: true`',
    async function () {
      assert.deepEqual(parse('abcdefghijklmnopqrstuvwxyz', {forgiving: true}), {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      })
    }
  )

  await t.test(
    'should return an empty schema for an empty private-use area',
    async function () {
      const empty = parse('')

      assert.deepEqual(parse('en-US-x'), empty)
      assert.deepEqual(parse('en-US-X'), empty)
      assert.deepEqual(parse('x'), empty)
      assert.deepEqual(parse('en-US-x-'), empty)
    }
  )

  await t.test('should warn for an empty private-use area', async function () {
    /** @type {Array<Parameters<Warning>>} */
    const warnings = []

    parse('en-US-x', {warning})
    parse('x', {warning})
    parse('en-US-x', {forgiving: true, warning})

    assert.deepEqual(warnings, [
      ['Empty private-use area, expected at least 1 subtag', 7, 7],
      ['Empty private-use area, expected at least 1 subtag', 7, 1],
      ['Empty private-use area, expected at least 1 subtag', 7, 7]
    ])

    /**
     * Collect the warning.
     *
     * @type {Warning}
     */
    function warning(...parameters) {
      warnings.push(parameters)
    }
  })

  await t.test(
    'should return values up to an empty private-use area when `forgiving: true`',
    async function () {
      assert.deepEqual(parse('en-US-x', {forgiving: true}), parse('en-US'))
    }
  )

  await t.test('should parse private-use subtags', async function () {
    assert.deepEqual(parse('x-a').privateuse, ['a'])
    assert.deepEqual(parse('en-US-x-a').privateuse, ['a'])
    assert.deepEqual(parse('en-US-x-a-x').privateuse, ['a', 'x'])
  })
})

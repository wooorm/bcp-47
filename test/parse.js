/**
 * @import {IrregularSchema, Message} from '../index.js'
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
      extendedLanguageSubtags: [],
      extensions: [],
      language: 'tlh',
      privateuse: [],
      region: undefined,
      script: undefined,
      type: 'language',
      variants: []
    })
  })

  await t.test(
    'should not normalize when `normalize: false`',
    async function () {
      assert.deepEqual(parse('i-klingon', {normalize: false}), {
        type: 'irregular',
        value: 'i-klingon'
      })
    }
  )

  await t.test(
    'should return an irregular when not normalizable',
    async function () {
      assert.deepEqual(parse('i-default'), {
        type: 'irregular',
        value: 'i-default'
      })
    }
  )

  await t.test(
    'should return a regular when not normalizable',
    async function () {
      assert.deepEqual(parse('zh-min'), {
        type: 'regular',
        value: 'zh-min'
      })
    }
  )

  await t.test(
    'should return irregulars in canonical casing',
    async function () {
      assert.deepEqual(parse('I-DEFAULT'), {
        type: 'irregular',
        value: 'i-default'
      })
      assert.deepEqual(parse('EN-gb-OED', {normalize: false}), {
        type: 'irregular',
        value: 'en-GB-oed'
      })
    }
  )

  await t.test('should return regulars in canonical casing', async function () {
    assert.deepEqual(parse('ZH-MIN'), {type: 'regular', value: 'zh-min'})
  })

  await t.test('should return canonical casing', async function () {
    assert.deepEqual(parse('ZH-YUE-hant-hk-1901-U-CO-PHONEBK-X-FOO'), {
      extendedLanguageSubtags: ['yue'],
      extensions: [{extensions: ['co', 'phonebk'], singleton: 'u'}],
      language: 'zh',
      privateuse: ['foo'],
      region: 'HK',
      script: 'Hant',
      type: 'language',
      variants: ['1901']
    })
  })

  await t.test('should narrow on `type`', async function () {
    const schema = parse('i-default')

    assert.equal(schema?.type, 'irregular')
    /** @type {IrregularSchema} */
    const irregularSchema = schema
    assert.equal(irregularSchema.value, 'i-default')
  })

  await t.test('should return `undefined` for an empty tag', async function () {
    assert.equal(parse(''), undefined)
  })

  await t.test('should not throw without `onmessage`', async function () {
    assert.equal(parse('en-GB-abcdefghi'), undefined)
  })

  await t.test(
    'should return `undefined` for a too long variant',
    async function () {
      assert.equal(parse('en-GB-abcdefghi'), undefined)
    }
  )

  await t.test(
    'should emit a fatal message for a too long variant',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('en-GB-abcdefghi', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(messages, [
        {
          actual: 'abcdefghi',
          fatal: true,
          range: [6, 15],
          reason:
            'Unexpected variant `abcdefghi` of 9 characters, expected at most 8 characters',
          ruleId: 'variant-too-long',
          source: 'bcp-47'
        }
      ])
    }
  )

  await t.test(
    'should return what was found before a too long variant when `forgiving: true`',
    async function () {
      assert.deepEqual(parse('en-GB-abcdefghi', {forgiving: true}), {
        extendedLanguageSubtags: [],
        extensions: [],
        language: 'en',
        privateuse: [],
        region: 'GB',
        script: undefined,
        type: 'language',
        variants: []
      })
    }
  )

  await t.test(
    'should return `undefined` for too many extended language subtags',
    async function () {
      assert.equal(parse('aa-bbb-ccc-ddd-eee'), undefined)
    }
  )

  await t.test(
    'should emit a fatal message for too many extended language subtags',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('aa-bbb-ccc-ddd-eee', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(messages, [
        {
          actual: 'eee',
          fatal: true,
          range: [15, 18],
          reason:
            'Unexpected extended language subtag `eee`, expected at most 3 extended language subtags',
          ruleId: 'extended-language-subtags-too-many',
          source: 'bcp-47'
        }
      ])
    }
  )

  await t.test(
    'should return what was found before too many extended language subtags when `forgiving: true`',
    async function () {
      assert.deepEqual(parse('aa-bbb-ccc-ddd-eee', {forgiving: true}), {
        extendedLanguageSubtags: ['bbb', 'ccc', 'ddd'],
        extensions: [],
        language: 'aa',
        privateuse: [],
        region: undefined,
        script: undefined,
        type: 'language',
        variants: []
      })
    }
  )

  await t.test(
    'should return `undefined` for a too long extension subtag',
    async function () {
      assert.equal(parse('en-i-abcdefghi'), undefined)
    }
  )

  await t.test(
    'should emit a fatal message for a too long extension subtag',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('en-i-abcdefghi', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(messages, [
        {
          actual: 'abcdefghi',
          fatal: true,
          range: [5, 14],
          reason:
            'Unexpected extension subtag `abcdefghi` of 9 characters, expected at most 8 characters',
          ruleId: 'extension-too-long',
          source: 'bcp-47'
        }
      ])
    }
  )

  await t.test(
    'should return what was found before a too long extension subtag when `forgiving: true`',
    async function () {
      assert.deepEqual(parse('en-i-abcdefghi', {forgiving: true}), {
        extendedLanguageSubtags: [],
        extensions: [],
        language: 'en',
        privateuse: [],
        region: undefined,
        script: undefined,
        type: 'language',
        variants: []
      })
    }
  )

  await t.test(
    'should return `undefined` for an empty extension',
    async function () {
      assert.equal(parse('en-i-a'), undefined)
    }
  )

  await t.test(
    'should emit a fatal message for an empty extension',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('en-i-a', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(messages, [
        {
          actual: 'i',
          fatal: true,
          range: [3, 4],
          reason:
            'Unexpected empty extension `i`, expected a subtag of 2 to 8 characters after the singleton',
          ruleId: 'extension-empty',
          source: 'bcp-47'
        }
      ])
    }
  )

  await t.test(
    'should return what was found before an empty extension when `forgiving: true`',
    async function () {
      assert.deepEqual(parse('en-i-a', {forgiving: true}), {
        extendedLanguageSubtags: [],
        extensions: [],
        language: 'en',
        privateuse: [],
        region: undefined,
        script: undefined,
        type: 'language',
        variants: []
      })
    }
  )

  await t.test(
    'should return `undefined` for a too long private-use subtag',
    async function () {
      assert.equal(parse('en-x-abcdefghi'), undefined)
    }
  )

  await t.test(
    'should emit a fatal message for a too long private-use subtag',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('en-x-abcdefghi', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(messages, [
        {
          actual: 'abcdefghi',
          fatal: true,
          range: [5, 14],
          reason:
            'Unexpected private-use subtag `abcdefghi` of 9 characters, expected at most 8 characters',
          ruleId: 'private-use-too-long',
          source: 'bcp-47'
        }
      ])
    }
  )

  await t.test(
    'should return what was found before a too long private-use subtag when `forgiving: true`',
    async function () {
      assert.deepEqual(parse('en-x-abcdefghi', {forgiving: true}), {
        extendedLanguageSubtags: [],
        extensions: [],
        language: 'en',
        privateuse: [],
        region: undefined,
        script: undefined,
        type: 'language',
        variants: []
      })
    }
  )

  await t.test(
    'should return `undefined` for an empty private-use sequence',
    async function () {
      assert.equal(parse('en-US-x'), undefined)
    }
  )

  await t.test(
    'should emit a fatal message for an empty private-use sequence',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('en-US-x', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(messages, [
        {
          actual: 'x',
          fatal: true,
          range: [6, 7],
          reason:
            'Unexpected empty private-use `x`, expected a subtag of 1 to 8 characters after the singleton',
          ruleId: 'private-use-empty',
          source: 'bcp-47'
        }
      ])
    }
  )

  await t.test(
    'should return what was found before an empty private-use sequence when `forgiving: true`',
    async function () {
      assert.deepEqual(parse('en-US-x', {forgiving: true}), {
        extendedLanguageSubtags: [],
        extensions: [],
        language: 'en',
        privateuse: [],
        region: 'US',
        script: undefined,
        type: 'language',
        variants: []
      })
    }
  )

  await t.test(
    'should return `undefined` for unexpected content',
    async function () {
      assert.equal(parse('abcdefghijklmnopqrstuvwxyz'), undefined)
    }
  )

  await t.test(
    'should emit a fatal message for unexpected content',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('abcdefghijklmnopqrstuvwxyz', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(messages, [
        {
          actual: 'abcdefghijklmnopqrstuvwxyz',
          fatal: true,
          range: [0, 26],
          reason:
            'Unexpected content `abcdefghijklmnopqrstuvwxyz`, expected end of tag',
          ruleId: 'tag-unexpected-content',
          source: 'bcp-47'
        }
      ])
    }
  )

  await t.test(
    'should return `undefined` when nothing was found before unexpected content, with `forgiving: true`',
    async function () {
      assert.equal(
        parse('abcdefghijklmnopqrstuvwxyz', {forgiving: true}),
        undefined
      )
    }
  )

  await t.test(
    'should return `undefined` for an empty private-use sequence (`en-US-X`)',
    async function () {
      assert.equal(parse('en-US-X'), undefined)
    }
  )

  await t.test(
    'should emit a message for an empty private-use sequence (`en-US-X`)',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('en-US-X', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(
        messages.map((d) => [d.ruleId, d.actual, d.range]),
        [['private-use-empty', 'X', [6, 7]]]
      )
    }
  )

  await t.test(
    'should return `undefined` for an empty private-use sequence (`x`)',
    async function () {
      assert.equal(parse('x'), undefined)
    }
  )

  await t.test(
    'should emit a message for an empty private-use sequence (`x`)',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('x', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(
        messages.map((d) => [d.ruleId, d.actual, d.range]),
        [['private-use-empty', 'x', [0, 1]]]
      )
    }
  )

  await t.test(
    'should return `undefined` for an empty private-use sequence (`en-US-x-`)',
    async function () {
      assert.equal(parse('en-US-x-'), undefined)
    }
  )

  await t.test(
    'should emit a message for an empty private-use sequence (`en-US-x-`)',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('en-US-x-', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(
        messages.map((d) => [d.ruleId, d.actual, d.range]),
        [['private-use-empty', 'x', [6, 7]]]
      )
    }
  )

  await t.test(
    'should emit a message for unexpected content after a singleton',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('en-i', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(
        messages.map((d) => [d.ruleId, d.actual, d.range]),
        [['tag-unexpected-content', '-i', [2, 4]]]
      )
    }
  )

  await t.test('should parse private-use subtags', async function () {
    assert.deepEqual(parse('x-a'), {privateuse: ['a'], type: 'privateuse'})
    assert.deepEqual(parse('x-a-x'), {
      privateuse: ['a', 'x'],
      type: 'privateuse'
    })
  })

  await t.test(
    'should parse a singleton repeated in private use',
    async function () {
      const schema = parse('en-a-bbb-x-a-ccc')
      assert.equal(schema?.type, 'language')
      assert.deepEqual(schema.privateuse, ['a', 'ccc'])
    }
  )

  await t.test(
    'should not emit messages for a singleton repeated in private use',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('en-a-bbb-x-a-ccc', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(messages, [])
    }
  )

  await t.test(
    'should parse a tag with a duplicate singleton',
    async function () {
      const schema = parse('en-a-bbb-a-ccc')
      assert.equal(schema?.type, 'language')
      assert.deepEqual(schema.extensions, [
        {extensions: ['bbb'], singleton: 'a'},
        {extensions: ['ccc'], singleton: 'a'}
      ])
    }
  )

  await t.test(
    'should emit a non-fatal message for a duplicate singleton',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('en-a-bbb-A-ccc', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(messages, [
        {
          actual: 'A',
          fatal: false,
          range: [9, 10],
          reason:
            'Unexpected duplicate singleton `A`, expected each singleton at most once',
          ruleId: 'singleton-duplicate',
          source: 'bcp-47'
        }
      ])
    }
  )

  await t.test(
    'should parse a tag with a duplicate variant',
    async function () {
      const schema = parse('de-DE-1901-1901')
      assert.equal(schema?.type, 'language')
      assert.deepEqual(schema.variants, ['1901', '1901'])
    }
  )

  await t.test(
    'should emit a non-fatal message for a duplicate variant',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('sl-rozaj-ROZAJ', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(messages, [
        {
          actual: 'ROZAJ',
          fatal: false,
          range: [9, 14],
          reason:
            'Unexpected duplicate variant `ROZAJ`, expected each variant at most once',
          ruleId: 'variant-duplicate',
          source: 'bcp-47'
        }
      ])
    }
  )

  await t.test(
    'should not emit messages for different singletons, variants',
    async function () {
      /** @type {Array<Message>} */
      const messages = []

      parse('sl-rozaj-biske-a-bb-b-cc', {
        onmessage(message) {
          messages.push(message)
        }
      })

      assert.deepEqual(messages, [])
    }
  )
})

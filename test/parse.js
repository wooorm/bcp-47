import assert from 'node:assert/strict'
import test from 'node:test'
import {parse} from '../index.js'

test('.parse()', async function (t) {
  assert.equal(typeof parse, 'function', 'should be a method')

  assert.throws(function () {
    // @ts-expect-error: `tag` missing.
    parse()
  }, 'should throw when given `undefined`')

  assert.throws(function () {
    // @ts-expect-error: `tag` incorrect.
    parse(null)
  }, 'should throw when given `null`')

  assert.doesNotThrow(function () {
    // @ts-expect-error: `tag` incorrect.
    parse({toString})
    function toString() {
      return 'en'
    }
  }, 'should coerce to a string')

  assert.deepEqual(
    parse('i-klingon'),
    {
      language: 'tlh',
      extendedLanguageSubtags: [],
      script: null,
      region: null,
      variants: [],
      extensions: [],
      privateuse: [],
      irregular: null,
      regular: null
    },
    'should normalize when possible'
  )

  assert.deepEqual(
    parse('i-klingon', {normalize: false}),
    {
      language: null,
      extendedLanguageSubtags: [],
      script: null,
      region: null,
      variants: [],
      extensions: [],
      privateuse: [],
      irregular: 'i-klingon',
      regular: null
    },
    'should not normalize when `normalize: false`'
  )

  assert.deepEqual(
    parse('i-default'),
    {
      language: null,
      extendedLanguageSubtags: [],
      script: null,
      region: null,
      variants: [],
      extensions: [],
      privateuse: [],
      irregular: 'i-default',
      regular: null
    },
    'should return an irregular when not normalizable'
  )

  assert.deepEqual(
    parse('zh-min'),
    {
      language: null,
      extendedLanguageSubtags: [],
      script: null,
      region: null,
      variants: [],
      extensions: [],
      privateuse: [],
      irregular: null,
      regular: 'zh-min'
    },
    'should return a regular when not normalizable'
  )

  await t.test('Too long variant', function () {
    const fixture = 'en-GB-abcdefghi'

    assert.deepEqual(
      parse(fixture, {warning}),
      {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      },
      'should return `null`'
    )

    function warning() {
      assert.equal(
        arguments[0],
        'Too long variant, expected at most 8 characters'
      )
      assert.equal(arguments[1], 1)
      assert.equal(arguments[2], 14)
      assert.equal(arguments.length, 3)
    }

    assert.deepEqual(
      parse(fixture, {forgiving: true}),
      {
        language: 'en',
        extendedLanguageSubtags: [],
        script: null,
        region: 'GB',
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      },
      'should return untill the error when `forgiving: true`'
    )
  })

  await t.test('Too many subtags', function () {
    const fixture = 'aa-bbb-ccc-ddd-eee'

    assert.deepEqual(
      parse(fixture, {warning}),
      {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      },
      'should return `null`'
    )

    function warning() {
      assert.equal(
        arguments[0],
        'Too many extended language subtags, expected at most 3 subtags'
      )
      assert.equal(arguments[1], 3)
      assert.equal(arguments[2], 14)
      assert.equal(arguments.length, 3)
    }

    assert.deepEqual(
      parse('aa-bbb-ccc-ddd-eee', {forgiving: true}),
      {
        language: 'aa',
        extendedLanguageSubtags: ['bbb', 'ccc', 'ddd'],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      },
      'should return untill the error when `forgiving: true`'
    )
  })

  await t.test('Too long extension', function () {
    const fixture = 'en-i-abcdefghi'

    assert.deepEqual(
      parse(fixture, {warning}),
      {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      },
      'should return `null`'
    )

    function warning() {
      assert.equal(
        arguments[0],
        'Too long extension, expected at most 8 characters'
      )
      assert.equal(arguments[1], 2)
      assert.equal(arguments[2], 13)
      assert.equal(arguments.length, 3)
    }

    assert.deepEqual(
      parse(fixture, {forgiving: true}),
      {
        language: 'en',
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      },
      'should return untill the error when `forgiving: true`'
    )
  })

  await t.test('Empty extension', function () {
    const fixture = 'en-i-a'

    assert.deepEqual(
      parse(fixture, {warning}),
      {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      },
      'should return `null`'
    )

    function warning() {
      assert.equal(
        arguments[0],
        'Empty extension, extensions must have at least 2 characters of content'
      )
      assert.equal(arguments[1], 4)
      assert.equal(arguments[2], 4)
      assert.equal(arguments.length, 3)
    }

    assert.deepEqual(
      parse(fixture, {forgiving: true}),
      {
        language: 'en',
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      },
      'should return untill the error when `forgiving: true`'
    )
  })

  await t.test('Too long private-use', function () {
    const fixture = 'en-x-abcdefghi'

    assert.deepEqual(
      parse(fixture, {warning}),
      {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      },
      'should return `null`'
    )

    function warning() {
      assert.equal(
        arguments[0],
        'Too long private-use area, expected at most 8 characters'
      )
      assert.equal(arguments[1], 5)
      assert.equal(arguments[2], 13)
      assert.equal(arguments.length, 3)
    }

    assert.deepEqual(
      parse(fixture, {forgiving: true}),
      {
        language: 'en',
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      },
      'should return untill the error when `forgiving: true`'
    )
  })

  await t.test('Extra content', function () {
    const fixture = 'abcdefghijklmnopqrstuvwxyz'

    assert.deepEqual(
      parse(fixture, {warning}),
      {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      },
      'should return `null`'
    )

    function warning() {
      assert.equal(arguments[0], 'Found superfluous content after tag')
      assert.equal(arguments[1], 6)
      assert.equal(arguments[2], 0)
      assert.equal(arguments.length, 3)
    }

    assert.deepEqual(
      parse(fixture, {forgiving: true}),
      {
        language: null,
        extendedLanguageSubtags: [],
        script: null,
        region: null,
        variants: [],
        extensions: [],
        privateuse: [],
        irregular: null,
        regular: null
      },
      'should return untill the error when `forgiving: true`'
    )
  })
})

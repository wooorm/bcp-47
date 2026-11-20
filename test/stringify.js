import assert from 'node:assert/strict'
import test from 'node:test'
import {stringify} from '../index.js'

test('stringify', async function (t) {
  await t.test('should be a function', async function () {
    assert.equal(typeof stringify, 'function')
  })

  await t.test(
    'should compile to an empty string without `schema`',
    async function () {
      assert.equal(stringify(), '')
    }
  )

  await t.test('should compile a language', async function () {
    assert.equal(stringify({language: 'tlh', type: 'language'}), 'tlh')
  })

  await t.test('should compile a private-use tag', async function () {
    assert.equal(
      stringify({privateuse: ['111', 'aaaaa', 'BBB'], type: 'privateuse'}),
      'x-111-aaaaa-BBB'
    )
  })

  await t.test('should compile an irregular', async function () {
    assert.equal(stringify({type: 'irregular', value: 'i-ami'}), 'i-ami')
  })

  await t.test('should compile a regular', async function () {
    assert.equal(stringify({type: 'regular', value: 'no-bok'}), 'no-bok')
  })

  await t.test('should type `irregular`', async function () {
    // @ts-expect-error: test runtime behavior.
    assert.equal(stringify({type: 'irregular', value: 'i-nope'}), 'i-nope')
  })

  await t.test('should type `regular`', async function () {
    // @ts-expect-error: test runtime behavior.
    assert.equal(stringify({type: 'regular', value: 'zh-nope'}), 'zh-nope')
  })

  await t.test(
    'should not compile a script without language',
    async function () {
      // @ts-expect-error: `script` needs `language`.
      assert.equal(stringify({script: 'Latn', type: 'language'}), '')
    }
  )

  await t.test(
    'should not compile other fields with an irregular',
    async function () {
      assert.equal(
        // @ts-expect-error: `language` cannot be used with `irregular`.
        stringify({language: 'en', type: 'irregular', value: 'i-ami'}),
        'i-ami'
      )
    }
  )

  await t.test(
    'should not compile private-use tags without subtags',
    async function () {
      // @ts-expect-error: `privateuse` needs a subtag.
      assert.equal(stringify({privateuse: [], type: 'privateuse'}), '')
    }
  )

  await t.test('should type `singleton`', async function () {
    assert.equal(
      stringify({
        extensions: [
          // @ts-expect-error: `x` is not a singleton.
          {extensions: ['ab'], singleton: 'x'}
        ],
        language: 'en',
        type: 'language'
      }),
      'en-x-ab'
    )
  })

  await t.test('should not compile empty extensions', async function () {
    assert.equal(
      stringify({
        // @ts-expect-error: `singleton`, `extensions` missing.
        extensions: [{}],
        language: 'en',
        region: 'GB',
        type: 'language'
      }),
      'en-GB'
    )
  })
})

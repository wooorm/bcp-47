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
    assert.equal(stringify({language: 'tlh'}), 'tlh')
  })

  await t.test('should compile a private-use area', async function () {
    assert.equal(
      stringify({privateuse: ['111', 'aaaaa', 'BBB']}),
      'x-111-aaaaa-BBB'
    )
  })

  await t.test('should compile an irregular', async function () {
    assert.equal(stringify({irregular: 'i-ami'}), 'i-ami')
  })

  await t.test('should compile a regular', async function () {
    assert.equal(stringify({regular: 'no-bok'}), 'no-bok')
  })

  await t.test('should type `irregular`', async function () {
    // @ts-expect-error: test runtime behavior.
    assert.equal(stringify({irregular: 'i-nope'}), 'i-nope')
  })

  await t.test('should type `regular`', async function () {
    // @ts-expect-error: test runtime behavior.
    assert.equal(stringify({regular: 'zh-nope'}), 'zh-nope')
  })

  await t.test(
    'should not compile a script without language',
    async function () {
      // @ts-expect-error: `script` needs `language`.
      assert.equal(stringify({script: 'Latn'}), '')
    }
  )

  await t.test(
    'should not compile other fields with an irregular',
    async function () {
      // @ts-expect-error: `language` cannot be used with `irregular`.
      assert.equal(stringify({irregular: 'i-ami', language: 'en'}), 'i-ami')
    }
  )

  await t.test('should type `singleton`', async function () {
    assert.equal(
      stringify({
        language: 'en',
        // @ts-expect-error: `x` is not a singleton.
        extensions: [{singleton: 'x', extensions: ['ab']}]
      }),
      'en-x-ab'
    )
  })

  await t.test('should not compile empty extensions', async function () {
    assert.equal(
      // @ts-expect-error: `singleton`, `extensions` missing.
      stringify({language: 'en', region: 'GB', extensions: [{}]}),
      'en-GB'
    )
  })
})

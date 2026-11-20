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

  await t.test(
    'should not compile a script without language',
    async function () {
      assert.equal(stringify({script: 'Latn'}), '')
    }
  )

  await t.test('should not compile empty extensions', async function () {
    assert.equal(
      // @ts-expect-error: `singleton`, `extensions` missing.
      stringify({language: 'en', region: 'GB', extensions: [{}]}),
      'en-GB'
    )
  })
})

import assert from 'node:assert/strict'
import test from 'node:test'
import {stringify} from '../index.js'

test('.stringify()', function () {
  assert.equal(typeof stringify, 'function', 'should be a method')

  assert.equal(
    stringify(),
    '',
    'should compile to an empty string when without `schema`'
  )

  assert.equal(stringify({language: 'tlh'}), 'tlh', 'should compile a language')

  assert.equal(
    stringify({privateuse: ['111', 'aaaaa', 'BBB']}),
    'x-111-aaaaa-BBB',
    'should compile a private-use area'
  )

  assert.equal(
    stringify({irregular: 'i-ami'}),
    'i-ami',
    'should compile an irregular'
  )

  assert.equal(
    stringify({regular: 'no-bok'}),
    'no-bok',
    'should compile an irregular'
  )

  assert.equal(
    stringify({script: 'Latn'}),
    '',
    'should not compile a script without language'
  )

  assert.equal(
    // @ts-expect-error: `singleton`, `extensions` missing.
    stringify({language: 'en', region: 'GB', extensions: [{}]}),
    'en-GB',
    'should not compile empty extensions'
  )
})

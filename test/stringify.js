import test from 'tape'
import {stringify} from '../index.js'

test('.stringify()', function (t) {
  t.equal(typeof stringify, 'function', 'should be a method')

  t.equal(
    stringify(),
    '',
    'should compile to an empty string when without `schema`'
  )

  t.equal(stringify({language: 'tlh'}), 'tlh', 'should compile a language')

  t.equal(
    stringify({privateuse: ['111', 'aaaaa', 'BBB']}),
    'x-111-aaaaa-BBB',
    'should compile a private-use area'
  )

  t.equal(
    stringify({irregular: 'i-ami'}),
    'i-ami',
    'should compile an irregular'
  )

  t.equal(
    stringify({regular: 'no-bok'}),
    'no-bok',
    'should compile an irregular'
  )

  t.equal(
    stringify({script: 'Latn'}),
    '',
    'should not compile a script without language'
  )

  t.equal(
    stringify({language: 'en', region: 'GB', extensions: [{}]}),
    'en-GB',
    'should not compile empty extensions'
  )

  t.end()
})

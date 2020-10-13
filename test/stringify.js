'use strict'

var test = require('tape')
var bcp47 = require('..')

test('.stringify()', function (t) {
  t.equal(typeof bcp47.stringify, 'function', 'should be a method')

  t.equal(
    bcp47.stringify(),
    '',
    'should compile to an empty string when without `schema`'
  )

  t.equal(
    bcp47.stringify({language: 'tlh'}),
    'tlh',
    'should compile a language'
  )

  t.equal(
    bcp47.stringify({privateuse: ['111', 'aaaaa', 'BBB']}),
    'x-111-aaaaa-BBB',
    'should compile a private-use area'
  )

  t.equal(
    bcp47.stringify({irregular: 'i-ami'}),
    'i-ami',
    'should compile an irregular'
  )

  t.equal(
    bcp47.stringify({regular: 'no-bok'}),
    'no-bok',
    'should compile an irregular'
  )

  t.equal(
    bcp47.stringify({script: 'Latn'}),
    '',
    'should not compile a script without language'
  )

  t.equal(
    bcp47.stringify({
      language: 'en',
      region: 'GB',
      extensions: [{}]
    }),
    'en-GB',
    'should not compile empty extensions'
  )

  t.end()
})

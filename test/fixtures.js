'use strict'

var fs = require('fs')
var path = require('path')
var test = require('tape')
var not = require('not')
var hidden = require('is-hidden')
var bcp47 = require('..')

test('fixtures', function (t) {
  var base = path.join(__dirname, 'fixtures')

  fs.readdirSync(base).filter(not(hidden)).forEach(check)

  t.end()

  function check(filename) {
    var expected = JSON.parse(fs.readFileSync(path.join(base, filename)))
    var tag = path.basename(filename, path.extname(filename))
    var actual = bcp47.parse(tag, {normalize: false})

    t.test(tag, function (st) {
      st.deepEqual(actual, expected, 'should parse')
      st.equal(bcp47.stringify(actual), tag, 'should stringify')
      st.end()
    })
  }
})

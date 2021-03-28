'use strict'

var fs = require('fs')
var path = require('path')
var test = require('tape')
var not = require('not')
var hidden = require('is-hidden')
var bcp47 = require('..')

test('fixtures', function (t) {
  var base = path.join(__dirname, 'fixtures')
  var files = fs.readdirSync(base).filter(not(hidden))
  var index = -1
  var filename
  var tag
  var actual
  var expected

  while (++index < files.length) {
    filename = files[index]
    tag = path.basename(filename, path.extname(filename))
    actual = bcp47.parse(tag, {normalize: false})
    expected = JSON.parse(fs.readFileSync(path.join(base, filename)))

    t.deepEqual(actual, expected, 'should parse `' + tag + '`')
    t.equal(bcp47.stringify(actual), tag, 'should stringify `' + tag + '`')
  }

  t.end()
})

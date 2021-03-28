'use strict'

import fs from 'fs'
import path from 'path'
import test from 'tape'
import not from 'not'
import {isHidden} from 'is-hidden'
import {parse, stringify} from '../index.js'

test('fixtures', function (t) {
  var base = path.join('test', 'fixtures')
  var files = fs.readdirSync(base).filter(not(isHidden))
  var index = -1
  var filename
  var tag
  var actual
  var expected

  while (++index < files.length) {
    filename = files[index]
    tag = path.basename(filename, path.extname(filename))
    actual = parse(tag, {normalize: false})
    expected = JSON.parse(fs.readFileSync(path.join(base, filename)))

    t.deepEqual(actual, expected, 'should parse `' + tag + '`')
    t.equal(stringify(actual), tag, 'should stringify `' + tag + '`')
  }

  t.end()
})

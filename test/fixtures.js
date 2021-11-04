import fs from 'node:fs'
import path from 'node:path'
import test from 'tape'
import {isHidden} from 'is-hidden'
import {parse, stringify} from '../index.js'

test('fixtures', function (t) {
  const base = path.join('test', 'fixtures')
  const files = fs.readdirSync(base).filter((d) => !isHidden(d))
  let index = -1

  while (++index < files.length) {
    const filename = files[index]
    const tag = path.basename(filename, path.extname(filename))
    const actual = parse(tag, {normalize: false})
    const expected = JSON.parse(fs.readFileSync(path.join(base, filename)))

    t.deepEqual(actual, expected, 'should parse `' + tag + '`')
    t.equal(stringify(actual), tag, 'should stringify `' + tag + '`')
  }

  t.end()
})

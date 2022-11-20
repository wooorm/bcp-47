/**
 * @typedef {import('../index.js').Schema} Schema
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import {isHidden} from 'is-hidden'
import {parse, stringify} from '../index.js'

/* eslint-disable no-await-in-loop */

const base = new URL('fixtures/', import.meta.url)

test('fixtures', async function () {
  const files = await fs.readdir(base)
  const applicable = files.filter((d) => !isHidden(d))
  let index = -1

  while (++index < applicable.length) {
    const filename = applicable[index]
    const tag = path.basename(filename, path.extname(filename))
    const actual = parse(tag, {normalize: false})
    /** @type {Schema} */
    const expected = JSON.parse(
      String(await fs.readFile(new URL(filename, base)))
    )

    assert.deepEqual(actual, expected, 'should parse `' + tag + '`')
    assert.equal(stringify(actual), tag, 'should stringify `' + tag + '`')
  }
})

/* eslint-enable no-await-in-loop */

/**
 * @import {Schema} from '../index.js'
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import test from 'node:test'
import {isHidden} from 'is-hidden'
import {parse, stringify} from '../index.js'

/* eslint-disable no-await-in-loop -- fixtures are checked in order. */

const base = new URL('fixtures/', import.meta.url)

test('fixtures', async function (t) {
  const files = await fs.readdir(base)
  const applicable = files.filter((d) => !isHidden(d))
  let index = -1

  while (++index < applicable.length) {
    const filename = applicable[index]
    const tag = path.basename(filename, path.extname(filename))

    await t.test(tag, async function () {
      const actual = parse(tag, {normalize: false})
      const url = new URL(filename, base)
      /** @type {Schema | undefined} */
      let expected

      if ('UPDATE' in process.env) {
        expected = actual
        await fs.writeFile(url, JSON.stringify(expected, undefined, 2) + '\n')
      } else {
        expected = JSON.parse(String(await fs.readFile(url)))
      }

      // JSON has no `undefined`: add missing fields back.
      if (expected?.type === 'language') {
        expected.region ??= undefined
        expected.script ??= undefined
      }

      assert.deepEqual(actual, expected)
      assert.equal(stringify(actual), tag)
    })
  }
})

/* eslint-enable no-await-in-loop */

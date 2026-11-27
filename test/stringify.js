import assert from 'node:assert/strict'
import test from 'node:test'
import {parse, stringify} from '../index.js'

test('stringify', async function (t) {
  await t.test('main', async function (t) {
    await t.test('should serialize w/o `schema`', async function () {
      // @ts-expect-error: test runtime behavior.
      assert.equal(stringify(), '')
    })

    await t.test('should serialize w/ `schema` of `undefined`', async function () {
      assert.equal(stringify(undefined), '')
    })

    await t.test('should fail on an unknown `type`', async function () {
      assert.throws(function () {
        // @ts-expect-error: test runtime behavior.
        stringify({type: 'nope'})
      }, /Unexpected `type` `nope`, expected `irregular`, `language`, `privateuse`, or `regular`/)
    })
  })

  await t.test('irregular', async function (t) {
    await t.test('should serialize an irregular legacy tag', async function () {
      assert.equal(stringify({type: 'irregular', value: 'i-ami'}), 'i-ami')
    })

    await t.test(
      'should fail on an unknown irregular legacy tag',
      async function () {
        assert.throws(function () {
          // @ts-expect-error: test runtime behavior.
          stringify({type: 'irregular', value: 'i-nope'})
        }, /Unexpected `value` `i-nope`, expected a known irregular tag/)
      }
    )
  })

  await t.test('language', async function (t) {
    await t.test('should work', async function () {
      const tag = 'zh-yue-Hant-HK-1901-a-bb-u-co-phonebk-x-foo'
      assert.equal(stringify(parse(tag)), tag)
    })

    await t.test('should serialize a language', async function () {
      assert.equal(stringify({language: 'tlh', type: 'language'}), 'tlh')
    })

    await t.test('should fail on too short languages', async function () {
      assert.throws(function () {
        stringify({language: 'x', type: 'language'})
      }, /Unexpected `language` `x`, expected between 2 and 8 letters/)
    })

    await t.test('should fail on too long languages', async function () {
      assert.throws(function () {
        stringify({language: 'xxxxxxxxx', type: 'language'})
      }, /Unexpected `language` `xxxxxxxxx`, expected between 2 and 8 letters/)
    })

    await t.test('should fail on non-letter languages', async function () {
      assert.throws(function () {
        stringify({language: '00', type: 'language'})
      }, /Unexpected `language` `00`, expected between 2 and 8 letters/)
    })

    await t.test('should ignore `null` fields', async function () {
      assert.equal(
        stringify({language: 'en', region: null, type: 'language'}),
        'en'
      )
    })

    await t.test(
      'should serialize extended language subtags',
      async function () {
        assert.equal(
          stringify({
            extendedLanguageSubtags: ['yue'],
            language: 'zh',
            type: 'language'
          }),
          'zh-yue'
        )
      }
    )

    await t.test(
      'should fail on more than 3 extended language subtags',
      async function () {
        assert.throws(function () {
          stringify({
            extendedLanguageSubtags: ['aaa', 'bbb', 'ccc', 'ddd'],
            language: 'zh',
            type: 'language'
          })
        }, /Unexpected `extendedLanguageSubtags` `aaa-bbb-ccc-ddd`, expected at most 3 subtags/)
      }
    )

    await t.test(
      'should fail on extended language subtags after a long language',
      async function () {
        assert.throws(function () {
          stringify({
            extendedLanguageSubtags: ['abc'],
            language: 'abcd',
            type: 'language'
          })
        }, /Unexpected `extendedLanguageSubtags` `abc` after `language` `abcd`, expected none after a language of 4 or more letters/)
      }
    )

    await t.test(
      'should fail on non-3-letter extended language subtags',
      async function () {
        assert.throws(function () {
          stringify({
            extendedLanguageSubtags: ['ab'],
            language: 'zh',
            type: 'language'
          })
        }, /Unexpected `extendedLanguageSubtags` `ab`, expected 3 letters/)
      }
    )

    await t.test('should serialize a script', async function () {
      assert.equal(
        stringify({language: 'sr', script: 'Latn', type: 'language'}),
        'sr-Latn'
      )
    })

    await t.test('should fail on non-4-letter scripts', async function () {
      assert.throws(function () {
        stringify({language: 'sr', script: 'Latin', type: 'language'})
      }, /Unexpected `script` `Latin`, expected 4 letters/)
    })

    await t.test('should serialize a letter region', async function () {
      assert.equal(
        stringify({language: 'en', region: 'GB', type: 'language'}),
        'en-GB'
      )
    })

    await t.test('should serialize a digit region', async function () {
      assert.equal(
        stringify({language: 'es', region: '419', type: 'language'}),
        'es-419'
      )
    })

    await t.test('should fail on other regions', async function () {
      assert.throws(function () {
        stringify({language: 'en', region: 'GBR', type: 'language'})
      }, /Unexpected `region` `GBR`, expected 2 letters or 3 digits/)
    })

    await t.test('should serialize variants', async function () {
      assert.equal(
        stringify({
          language: 'sl',
          type: 'language',
          variants: ['rozaj', '1994']
        }),
        'sl-rozaj-1994'
      )
    })

    await t.test('should fail on invalid variants', async function () {
      assert.throws(function () {
        stringify({language: 'en', type: 'language', variants: ['abcd']})
      }, /Unexpected `variants` `abcd`, expected between 5 and 8 letters or digits, or a digit and 3 letters or digits/)
    })

    await t.test('should serialize extensions', async function () {
      assert.equal(
        stringify({
          extensions: [{extensions: ['co', 'phonebk'], singleton: 'u'}],
          language: 'de',
          type: 'language'
        }),
        'de-u-co-phonebk'
      )
    })

    await t.test('should fail on a singleton `x`', async function () {
      assert.throws(function () {
        stringify({
          // @ts-expect-error: test runtime behavior.
          extensions: [{extensions: ['ab'], singleton: 'x'}],
          language: 'en',
          type: 'language'
        })
      }, /Unexpected `singleton` `x`, expected a letter or digit other than `x`/)
    })

    await t.test('should fail on extensions w/o subtags', async function () {
      assert.throws(function () {
        stringify({
          extensions: [{extensions: [], singleton: 'u'}],
          language: 'en',
          type: 'language'
        })
      }, /Unexpected empty `extensions` for `singleton` `u`, expected at least 1 subtag/)
    })

    await t.test(
      'should fail on too short extension subtags',
      async function () {
        assert.throws(function () {
          stringify({
            extensions: [{extensions: ['a'], singleton: 'u'}],
            language: 'en',
            type: 'language'
          })
        }, /Unexpected `extensions` `a`, expected between 2 and 8 letters or digits/)
      }
    )

    await t.test('should serialize private-use subtags', async function () {
      assert.equal(
        stringify({language: 'en', privateuse: ['foo'], type: 'language'}),
        'en-x-foo'
      )
    })
  })

  await t.test('privateuse', async function (t) {
    await t.test('should serialize', async function () {
      assert.equal(stringify({privateuse: ['a'], type: 'privateuse'}), 'x-a')
    })

    await t.test('should fail on too short subtags', async function () {
      assert.throws(function () {
        stringify({privateuse: [''], type: 'privateuse'})
      }, /Unexpected empty `privateuse` subtag, expected between 1 and 8 letters or digits/)
    })

    await t.test('should fail on too long subtags', async function () {
      assert.throws(function () {
        stringify({privateuse: ['abcdefghi'], type: 'privateuse'})
      }, /Unexpected `privateuse` `abcdefghi`, expected between 1 and 8 letters or digits/)
    })
  })

  await t.test('regular', async function (t) {
    await t.test('should serialize a regular legacy tag', async function () {
      assert.equal(stringify({type: 'regular', value: 'zh-min'}), 'zh-min')
    })

    await t.test(
      'should fail on an unknown regular legacy tag',
      async function () {
        assert.throws(function () {
          // @ts-expect-error: test runtime behavior.
          stringify({type: 'regular', value: 'zh-nope'})
        }, /Unexpected `value` `zh-nope`, expected a known regular tag/)
      }
    )
  })
})

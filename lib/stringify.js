/**
 * @import {
 *   Extension,
 *   IrregularSchema,
 *   PrivateUseSchema,
 *   RegularSchema
 * } from './parse.js'
 */

/**
 * @typedef LanguageSchemaInput
 *   Language tag to serialize.
 *
 *   Like `LanguageSchema`, but fields without a value can be omitted.
 * @property {Array<string> | null | undefined} [extendedLanguageSubtags]
 *   Extended language subtags, such as `yue` in `zh-yue-HK` (optional).
 * @property {Array<Extension> | null | undefined} [extensions]
 *   Extensions, such as `u-co-phonebk` in `de-DE-u-co-phonebk` (optional).
 * @property {string} language
 *   ISO 639 language code or registered language subtag,
 *   such as `en` or `cmn`.
 * @property {Array<string> | null | undefined} [privateuse]
 *   Private-use subtags, such as `foo` in `en-x-foo` (optional).
 * @property {string | null | undefined} [region]
 *   ISO 3166-1 or UN M49 code,
 *   such as `CN` in `cmn-Hans-CN` or `419` in `es-419` (optional).
 * @property {string | null | undefined} [script]
 *   ISO 15924 script code, such as `Latn` in `hy-Latn-IT-arevela` (optional).
 * @property {'language'} type
 *   Kind of tag.
 * @property {Array<string> | null | undefined} [variants]
 *   Variant subtags, such as `rozaj` and `biske` in `sl-rozaj-biske`
 *   (optional).
 */

/**
 * @typedef {(
 *   IrregularSchema |
 *   LanguageSchemaInput |
 *   PrivateUseSchema |
 *   RegularSchema
 * )} SchemaInput
 *   Tag to serialize.
 */

import {isAlphanumerical} from 'is-alphanumerical'
import {isAlphabetical} from 'is-alphabetical'
import {isDecimal} from 'is-decimal'
import {irregular} from './irregular.js'
import {regular} from './regular.js'

/**
 * Compile a language schema to a BCP 47 language tag.
 *
 * @param {SchemaInput | null | undefined} [schema]
 *   Tag to serialize (optional).
 * @returns {string}
 *   BCP 47 language tag.
 * @throws {Error}
 *   When `schema` would not make a well-formed tag,
 *   such as a `region` of 3 letters or a `singleton` of `x`.
 */
export function stringify(schema) {
  if (!schema) {
    return ''
  }

  if (schema.type === 'irregular' || schema.type === 'regular') {
    const {type, value} = schema
    /** @type {ReadonlyArray<string>} */
    const tags = type === 'irregular' ? irregular : regular

    if (!tags.includes(value)) {
      throw new Error(
        'Unexpected `value` `' + value + '`, expected a known ' + type + ' tag'
      )
    }

    return value
  }

  if (schema.type === 'language') {
    if (!is(schema.language, 2, 8, isAlphabetical)) {
      throw new Error(
        'Unexpected `language` `' +
          schema.language +
          '`, expected between 2 and 8 letters'
      )
    }

    const result = [schema.language]

    if (schema.extendedLanguageSubtags) {
      const display = schema.extendedLanguageSubtags.join('-')

      if (schema.extendedLanguageSubtags.length > 3) {
        throw new Error(
          'Unexpected `extendedLanguageSubtags` `' +
            display +
            '`, expected at most 3 subtags'
        )
      }

      if (
        schema.language.length > 3 &&
        schema.extendedLanguageSubtags.length > 0
      ) {
        throw new Error(
          'Unexpected `extendedLanguageSubtags` `' +
            display +
            '` after `language` `' +
            schema.language +
            '`, expected none after a language of 4 or more letters'
        )
      }

      let index = -1

      while (++index < schema.extendedLanguageSubtags.length) {
        const subtag = schema.extendedLanguageSubtags[index]
        if (!is(subtag, 3, 3, isAlphabetical)) {
          throw new Error(
            'Unexpected `extendedLanguageSubtags` `' +
              subtag +
              '`, expected 3 letters'
          )
        }

        result.push(subtag)
      }
    }

    if (schema.script) {
      if (!is(schema.script, 4, 4, isAlphabetical)) {
        throw new Error(
          'Unexpected `script` `' + schema.script + '`, expected 4 letters'
        )
      }

      result.push(schema.script)
    }

    if (schema.region) {
      if (
        !is(schema.region, 2, 2, isAlphabetical) &&
        !is(schema.region, 3, 3, isDecimal)
      ) {
        throw new Error(
          'Unexpected `region` `' +
            schema.region +
            '`, expected 2 letters or 3 digits'
        )
      }

      result.push(schema.region)
    }

    if (schema.variants) {
      let index = -1

      while (++index < schema.variants.length) {
        const subtag = schema.variants[index]

        if (
          !is(subtag, 5, 8, isAlphanumerical) &&
          !(
            is(subtag, 4, 4, isAlphanumerical) &&
            isDecimal(subtag.charCodeAt(0))
          )
        ) {
          throw new Error(
            'Unexpected `variants` `' +
              subtag +
              '`, expected between 5 and 8 letters or digits, or a digit and 3 letters or digits'
          )
        }

        result.push(subtag)
      }
    }

    if (schema.extensions) {
      for (const extension of schema.extensions) {
        const {singleton, extensions} = extension

        if (
          !is(singleton, 1, 1, isAlphanumerical) ||
          singleton.toLowerCase() === 'x'
        ) {
          throw new Error(
            'Unexpected `singleton` `' +
              singleton +
              '`, expected a letter or digit other than `x`'
          )
        }

        if (!extensions || extensions.length === 0) {
          throw new Error(
            'Unexpected empty `extensions` for `singleton` `' +
              singleton +
              '`, expected at least 1 subtag'
          )
        }

        result.push(singleton)

        for (const subtag of extensions) {
          if (!is(subtag, 2, 8, isAlphanumerical)) {
            throw new Error(
              'Unexpected `extensions` `' +
                subtag +
                '`, expected between 2 and 8 letters or digits'
            )
          }

          result.push(subtag)
        }
      }
    }

    if (schema.privateuse && schema.privateuse.length > 0) {
      privateUse(schema.privateuse)
      result.push('x', ...schema.privateuse)
    }

    return result.join('-')
  }

  if (schema.type === 'privateuse') {
    privateUse(schema.privateuse)
    return ['x', ...schema.privateuse].join('-')
  }

  throw new Error(
    'Unexpected `type` `' +
      // @ts-expect-error: indeed.
      schema.type +
      '`, expected `irregular`, `language`, `privateuse`, or `regular`'
  )
}

/**
 * Check private-use subtags.
 *
 * @param {Array<string>} subtags
 *   Private-use subtags to check.
 * @returns {undefined}
 *   Nothing.
 */
function privateUse(subtags) {
  for (const subtag of subtags) {
    if (!is(subtag, 1, 8, isAlphanumerical)) {
      const display = subtag
        ? '`privateuse` `' + subtag + '`'
        : 'empty `privateuse` subtag'
      throw new Error(
        'Unexpected ' + display + ', expected between 1 and 8 letters or digits'
      )
    }
  }
}

/**
 * Check that `value` passes.
 *
 * @param {string} value
 *   Subtag to check.
 * @param {number} min
 *   Minimum number of characters.
 * @param {number} max
 *   Maximum number of characters.
 * @param {(code: number) => boolean} check
 *   Check for each character.
 * @returns {boolean}
 *   Whether `value` passes.
 */
function is(value, min, max, check) {
  if (value.length < min || value.length > max) return false

  let index = -1

  while (++index < value.length) {
    if (!check(value.charCodeAt(index))) return false
  }

  return true
}

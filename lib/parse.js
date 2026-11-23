/**
 * @callback Warning
 *   Called when an error occurs.
 *
 *   | code | reason                                                                 |
 *   | :--- | :--------------------------------------------------------------------- |
 *   | 1    | Too long variant, expected at most 8 characters                        |
 *   | 2    | Too long extension, expected at most 8 characters                      |
 *   | 3    | Too many extended language subtags, expected at most 3 subtags         |
 *   | 4    | Empty extension, extensions must have at least 2 characters of content |
 *   | 5    | Too long private-use area, expected at most 8 characters               |
 *   | 6    | Found superfluous content after tag                                    |
 *   | 7    | Empty private-use area, expected at least 1 subtag                     |
 * @param {string} reason
 *   Reason for failure in English.
 * @param {number} code
 *   Code for failure.
 * @param {number} offset
 *   Index of place where the error occurred in the tag.
 * @returns {undefined}
 *   Nothing.
 */

/**
 * @typedef Options
 *   Configuration for `parse`.
 * @property {boolean | null | undefined} [forgiving=false]
 *   Keep what was found before an error,
 *   instead of returning an empty schema (default: `false`).
 * @property {boolean | null | undefined} [normalize=true]
 *   Replace deprecated tags with their preferred value,
 *   such as `i-klingon` with `tlh` (default: `true`).
 * @property {Warning | null | undefined} [warning]
 *   Called when an error is found (optional).
 */

/**
 * @typedef Extension
 *   Extension subtag with its singleton.
 *
 *   For example, `u-co-phonebk` in `de-DE-u-co-phonebk`.
 * @property {Array<string>} extensions
 *   Subtags, such as `co` and `phonebk`.
 * @property {string} singleton
 *   Single character that is not `x`, such as `u`.
 */

/**
 * @typedef Schema
 *   Parsed language tag.
 *
 *   A schema is deemed empty when it has neither
 *   `language`, `irregular`, `regular`, nor `privateuse`
 *   (where an empty `privateuse` array is handled as no `privateuse` as well).
 * @property {Array<string>} extendedLanguageSubtags
 *   Extended language subtags, such as `yue` in `zh-yue-HK`.
 * @property {Array<Extension>} extensions
 *   Extensions, such as `u-co-phonebk` in `de-DE-u-co-phonebk`.
 * @property {string | null | undefined} irregular
 *   Irregular legacy tag, such as `i-default`.
 * @property {string | null | undefined} language
 *   ISO 639 language code or registered language subtag,
 *   such as `en` or `cmn`.
 * @property {Array<string>} privateuse
 *   Private-use subtags, such as `foo` in `en-x-foo`.
 * @property {string | null | undefined} region
 *   ISO 3166-1 or UN M49 code,
 *   such as `CN` in `cmn-Hans-CN` or `419` in `es-419`.
 * @property {string | null | undefined} regular
 *   Regular legacy tag, such as `zh-min`.
 * @property {string | null | undefined} script
 *   ISO 15924 script code, such as `Latn` in `hy-Latn-IT-arevela`.
 * @property {Array<string>} variants
 *   Variant subtags, such as `rozaj` and `biske` in `sl-rozaj-biske`.
 */

import {isAlphanumerical} from 'is-alphanumerical'
import {isAlphabetical} from 'is-alphabetical'
import {isDecimal} from 'is-decimal'
import {regular} from './regular.js'
import {normal} from './normal.js'

const own = {}.hasOwnProperty

/**
 * Parse a BCP 47 language tag.
 *
 * > 👉 **Note**:
 * > the algorithm is case insensitive.
 *
 * @param {string} tag
 *   BCP 47 tag to parse.
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {Schema}
 *   Parsed BCP 47 language tag.
 * @throws {Error}
 *   When `tag` is `null` or `undefined`.
 */
export function parse(tag, options) {
  // Check input.
  if (tag === null || tag === undefined) {
    throw new Error('Expected string, got `' + tag + '`')
  }

  const settings = options || {}
  const result = empty()
  const source = String(tag)
  const value = source.toLowerCase()

  // Let’s start.
  // First: the edge cases.
  if (own.call(normal, value)) {
    const replacement = normal[value]

    if (
      (settings.normalize === null ||
        settings.normalize === undefined ||
        settings.normalize) &&
      typeof replacement === 'string'
    ) {
      return parse(replacement)
    }

    result[regular.includes(value) ? 'regular' : 'irregular'] = source

    return result
  }

  let index = 0

  // Now, to actually parse, eat what could be a language.
  while (isAlphabetical(value.charCodeAt(index)) && index < 9) index++

  // A language.
  if (index > 1 /* Min 639. */ && index < 9 /* Max subtag. */) {
    // 5 and up is a subtag.
    // 4 is the size of reserved languages.
    // 3 an ISO 639-2 or ISO 639-3.
    // 2 is an ISO 639-1.
    // <https://github.com/wooorm/iso-639-2>
    // <https://github.com/wooorm/iso-639-3>
    result.language = source.slice(0, index)

    if (index < 4 /* Max 639. */) {
      let groups = 0

      while (
        value.charCodeAt(index) === 45 /* `-` */ &&
        isAlphabetical(value.charCodeAt(index + 1)) &&
        isAlphabetical(value.charCodeAt(index + 2)) &&
        isAlphabetical(value.charCodeAt(index + 3)) &&
        !isAlphanumerical(value.charCodeAt(index + 4))
      ) {
        if (groups > 2 /* Max extended language subtag count. */) {
          return fail(
            index,
            3,
            'Too many extended language subtags, expected at most 3 subtags'
          )
        }

        // Extended language subtag.
        result.extendedLanguageSubtags.push(source.slice(index + 1, index + 4))
        index += 4
        groups++
      }
    }

    // ISO 15924 script.
    // <https://github.com/wooorm/iso-15924>
    if (
      value.charCodeAt(index) === 45 /* `-` */ &&
      isAlphabetical(value.charCodeAt(index + 1)) &&
      isAlphabetical(value.charCodeAt(index + 2)) &&
      isAlphabetical(value.charCodeAt(index + 3)) &&
      isAlphabetical(value.charCodeAt(index + 4)) &&
      !isAlphanumerical(value.charCodeAt(index + 5))
    ) {
      result.script = source.slice(index + 1, index + 5)
      index += 5
    }

    if (value.charCodeAt(index) === 45 /* `-` */) {
      // ISO 3166-1 region.
      // <https://github.com/wooorm/iso-3166>
      if (
        isAlphabetical(value.charCodeAt(index + 1)) &&
        isAlphabetical(value.charCodeAt(index + 2)) &&
        !isAlphanumerical(value.charCodeAt(index + 3))
      ) {
        result.region = source.slice(index + 1, index + 3)
        index += 3
      }
      // UN M49 region.
      // <https://github.com/wooorm/un-m49>
      else if (
        isDecimal(value.charCodeAt(index + 1)) &&
        isDecimal(value.charCodeAt(index + 2)) &&
        isDecimal(value.charCodeAt(index + 3)) &&
        !isAlphanumerical(value.charCodeAt(index + 4))
      ) {
        result.region = source.slice(index + 1, index + 4)
        index += 4
      }
    }

    while (value.charCodeAt(index) === 45 /* `-` */) {
      const start = index + 1
      let offset = start

      while (isAlphanumerical(value.charCodeAt(offset))) {
        if (offset - start > 7 /* Max variant. */) {
          return fail(
            offset,
            1,
            'Too long variant, expected at most 8 characters'
          )
        }

        offset++
      }

      if (
        // Long variant.
        offset - start > 4 /* Min alpha numeric variant. */ ||
        // Short variant.
        (offset - start > 3 /* Min variant. */ &&
          isDecimal(value.charCodeAt(start)))
      ) {
        result.variants.push(source.slice(start, offset))
        index = offset
      }
      // Something else.
      else {
        break
      }
    }

    // Extensions.
    /** @type {Array<string>} */
    const singletons = []

    while (value.charCodeAt(index) === 45 /* `-` */) {
      // Exit if this isn’t an extension.
      if (
        value.charCodeAt(index + 1) === 120 /* `x` */ ||
        !isAlphanumerical(value.charCodeAt(index + 1)) ||
        value.charCodeAt(index + 2) !== 45 /* `-` */ ||
        !isAlphanumerical(value.charCodeAt(index + 3))
      ) {
        break
      }

      // A singleton may appear only once (private use is parsed below).
      const singleton = value.charAt(index + 1)

      if (singletons.includes(singleton)) {
        return fail(
          index + 1,
          8,
          'Duplicate singleton, singletons must not be repeated'
        )
      }

      singletons.push(singleton)

      let offset = index + 2
      let groups = 0

      while (
        value.charCodeAt(offset) === 45 /* `-` */ &&
        isAlphanumerical(value.charCodeAt(offset + 1)) &&
        isAlphanumerical(value.charCodeAt(offset + 2))
      ) {
        const start = offset + 1
        offset = start + 2
        groups++

        while (isAlphanumerical(value.charCodeAt(offset))) {
          if (offset - start > 7 /* Max extension. */) {
            return fail(
              offset,
              2,
              'Too long extension, expected at most 8 characters'
            )
          }

          offset++
        }
      }

      if (!groups) {
        return fail(
          offset,
          4,
          'Empty extension, extensions must have at least 2 characters of content'
        )
      }

      result.extensions.push({
        extensions: source.slice(index + 3, offset).split('-'),
        singleton: source.charAt(index + 1)
      })

      index = offset
    }
  }
  // Not a language.
  else {
    index = 0
  }

  // Private use.
  if (
    (index === 0 && value.charCodeAt(index) === 120) /* `x` */ ||
    (value.charCodeAt(index) === 45 /* `-` */ &&
      value.charCodeAt(index + 1) === 120) /* `x` */
  ) {
    index = index ? index + 2 : 1
    let offset = index

    while (
      value.charCodeAt(offset) === 45 /* `-` */ &&
      isAlphanumerical(value.charCodeAt(offset + 1))
    ) {
      const start = index + 1
      offset = start

      while (isAlphanumerical(value.charCodeAt(offset))) {
        if (offset - start > 7 /* Max private use. */) {
          return fail(
            offset,
            5,
            'Too long private-use area, expected at most 8 characters'
          )
        }

        offset++
      }

      result.privateuse.push(source.slice(index + 1, offset))
      index = offset
    }

    if (result.privateuse.length === 0) {
      return fail(
        index,
        7,
        'Empty private-use area, expected at least 1 subtag'
      )
    }
  }

  if (index !== source.length) {
    return fail(index, 6, 'Found superfluous content after tag')
  }

  return result

  /**
   * Stop.
   *
   * @param {number} offset
   *   Index of place where the error occurred in the tag.
   * @param {number} code
   *   Code for failure.
   * @param {string} reason
   *   Reason for failure in English.
   * @returns {Schema}
   *   Partial result in forgiving mode, empty result otherwise.
   */
  function fail(offset, code, reason) {
    if (settings.warning) settings.warning(reason, code, offset)
    return settings.forgiving ? result : empty()
  }
}

/**
 * Create an empty results object.
 *
 * @returns {Schema}
 *   Empty schema.
 */
function empty() {
  return {
    extendedLanguageSubtags: [],
    extensions: [],
    irregular: null,
    language: null,
    privateuse: [],
    region: null,
    regular: null,
    script: null,
    variants: []
  }
}

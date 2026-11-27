/**
 * @typedef Extension
 *   Extension subtag with its singleton.
 *
 *   For example, `u-co-phonebk` in `de-DE-u-co-phonebk`.
 * @property {Array<string>} extensions
 *   Subtags, such as `co` and `phonebk`.
 * @property {Singleton} singleton
 *   Singleton, such as `u`.
 */

/**
 * @typedef IrregularSchema
 *   Parsed irregular legacy tag.
 * @property {'irregular'} type
 *   Kind of tag.
 * @property {Irregular} value
 *   Irregular legacy tag, such as `i-default`.
 */

/**
 * @typedef {(typeof irregular)[number]} Irregular
 *   Irregular legacy tag.
 *
 *   These tags do not match the BCP 47 grammar.
 */

/**
 * @typedef LanguageSchema
 *   Parsed language tag.
 * @property {Array<string>} extendedLanguageSubtags
 *   Extended language subtags, such as `yue` in `zh-yue-HK`.
 * @property {Array<Extension>} extensions
 *   Extensions, such as `u-co-phonebk` in `de-DE-u-co-phonebk`.
 * @property {string} language
 *   ISO 639 language code or registered language subtag,
 *   such as `en` or `cmn`.
 * @property {Array<string>} privateuse
 *   Private-use subtags, such as `foo` in `en-x-foo`.
 * @property {string | undefined} region
 *   ISO 3166-1 or UN M49 code,
 *   such as `CN` in `cmn-Hans-CN` or `419` in `es-419`.
 * @property {string | undefined} script
 *   ISO 15924 script code, such as `Latn` in `hy-Latn-IT-arevela`.
 * @property {'language'} type
 *   Kind of tag.
 * @property {Array<string>} variants
 *   Variant subtags, such as `rozaj` and `biske` in `sl-rozaj-biske`.
 */

/**
 * @typedef Message
 *   Message about a problem in a tag.
 * @property {string} actual
 *   Part of the tag that is reported, such as `abcdefghi`.
 * @property {Array<string> | undefined} [expected]
 *   Suggested values to use instead of `actual` (optional).
 * @property {boolean} fatal
 *   Whether the tag could not be parsed;
 *   `true` when it does not match the BCP 47 grammar (it is not well-formed),
 *   `false` when it matches the grammar but breaks another rule
 *   (it is not valid).
 * @property {[start: number, end: number]} range
 *   Offsets of the reported part in the tag
 *   (0-indexed start, and the index after the end).
 * @property {string} reason
 *   Reason for the message, in English (uses markdown).
 * @property {RuleId} ruleId
 *   Category of the message, such as `'variant-too-long'`.
 * @property {'bcp-47'} source
 *   Namespace of the message.
 */

/**
 * @callback OnMessage
 *   Called when a problem is found.
 * @param {Message} message
 *   Message about a problem in a tag.
 * @returns {undefined}
 *   Nothing.
 */

/**
 * @typedef Options
 *   Configuration for `parse`.
 * @property {boolean | null | undefined} [forgiving=false]
 *   Keep what was found before a fatal error,
 *   instead of returning `undefined` (default: `false`).
 * @property {boolean | null | undefined} [normalize=true]
 *   Replace deprecated tags with their preferred value,
 *   such as `i-klingon` with `tlh` (default: `true`).
 * @property {OnMessage | null | undefined} [onmessage]
 *   Called when a problem is found (optional).
 */

/**
 * @typedef PrivateUseSchema
 *   Parsed private-use tag.
 * @property {[first: string, ...rest: Array<string>]} privateuse
 *   Private-use subtags, such as `foo` in `x-foo`.
 * @property {'privateuse'} type
 *   Kind of tag.
 */

/**
 * @typedef {(typeof regular)[number]} Regular
 *   Regular legacy tag.
 *
 *   These tags match the BCP 47 grammar but mean something different.
 */

/**
 * @typedef RegularSchema
 *   Parsed regular legacy tag.
 * @property {'regular'} type
 *   Kind of tag.
 * @property {Regular} value
 *   Regular legacy tag, such as `zh-min`.
 */

/**
 * @typedef {(
 *   'extended-language-subtags-too-many' |
 *   'extension-empty' |
 *   'extension-too-long' |
 *   'private-use-empty' |
 *   'private-use-too-long' |
 *   'singleton-duplicate' |
 *   'tag-unexpected-content' |
 *   'variant-duplicate' |
 *   'variant-too-long'
 * )} RuleId
 *   Category of a message.
 */

/**
 * @typedef {(
 *   IrregularSchema |
 *   LanguageSchema |
 *   PrivateUseSchema |
 *   RegularSchema
 * )} Schema
 *   Parsed tag.
 *
 *   Check `type` to find out which kind of tag it is.
 */

/**
 * @typedef {(
 *   '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' |
 *   'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' |
 *   'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' |
 *   'u' | 'v' | 'w' | 'y' | 'z'
 * )} Singleton
 *   Extension singleton (any lowercase ASCII letter or digit except `x`).
 */

import {isAlphanumerical} from 'is-alphanumerical'
import {isAlphabetical} from 'is-alphabetical'
import {isDecimal} from 'is-decimal'
import {irregular} from './irregular.js'
import {regular} from './regular.js'
import {normal} from './normal.js'

/**
 * Parse a BCP 47 language tag.
 *
 * > 👉 **Note**:
 * > the algorithm is case insensitive.
 * > Subtags are returned in their canonical casing
 * > (RFC 5646 § 2.1.1).
 *
 * @param {string} tag
 *   BCP 47 tag to parse.
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {Schema | undefined}
 *   Parsed BCP 47 language tag;
 *   `undefined` when nothing was parsed
 *   (an empty tag, or a fatal problem without `forgiving`).
 */
export function parse(tag, options) {
  if (typeof tag !== 'string') {
    throw new TypeError('Unexpected `tag` `' + tag + '`, expected `string`')
  }

  const value = tag.toLowerCase()
  const settings = options || {}

  // Let’s start.
  // First: the edge cases.
  const irregularTag = irregular.find((d) => d.toLowerCase() === value)
  const regularTag = regular.find((d) => d === value)
  /** @type {IrregularSchema | RegularSchema | undefined} */
  let legacy

  if (irregularTag) {
    legacy = {type: 'irregular', value: irregularTag}
  } else if (regularTag) {
    legacy = {type: 'regular', value: regularTag}
  }

  if (legacy) {
    const replacement = normal[value]

    return (settings.normalize === null ||
      settings.normalize === undefined ||
      settings.normalize) &&
      replacement
      ? parse(replacement)
      : legacy
  }

  /** @type {Array<string>} */
  const extendedLanguageSubtags = []
  /** @type {Array<Extension>} */
  const extensions = []
  /** @type {string | undefined} */
  let language
  /** @type {Array<string>} */
  const privateuse = []
  /** @type {string | undefined} */
  let region
  /** @type {string | undefined} */
  let script
  /** @type {Array<string>} */
  const variants = []
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
    language = value.slice(0, index)

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
            'extended-language-subtags-too-many',
            index + 1,
            index + 4,
            'Unexpected extended language subtag `' +
              tag.slice(index + 1, index + 4) +
              '`, expected at most 3 extended language subtags'
          )
        }

        // Extended language subtag.
        extendedLanguageSubtags.push(value.slice(index + 1, index + 4))
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
      script =
        value.charAt(index + 1).toUpperCase() +
        value.slice(index + 2, index + 5)
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
        region = value.slice(index + 1, index + 3).toUpperCase()
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
        region = value.slice(index + 1, index + 4)
        index += 4
      }
    }

    while (value.charCodeAt(index) === 45 /* `-` */) {
      const start = index + 1
      const end = subtagEnd(start)
      const size = end - start

      if (size > 8 /* Max variant. */) {
        return fail(
          'variant-too-long',
          start,
          end,
          'Unexpected variant `' +
            tag.slice(start, end) +
            '` of ' +
            size +
            ' characters, expected at most 8 characters'
        )
      }

      if (
        // Long variant.
        size > 4 /* Min alpha numeric variant. */ ||
        // Short variant.
        (size > 3 /* Min variant. */ && isDecimal(value.charCodeAt(start)))
      ) {
        const variant = value.slice(start, end)

        if (variants.includes(variant)) {
          emit(
            'variant-duplicate',
            start,
            end,
            'Unexpected duplicate variant `' +
              tag.slice(start, end) +
              '`, expected each variant at most once'
          )
        }

        variants.push(variant)
        index = end
      }
      // Something else.
      else {
        break
      }
    }

    // Extensions.
    while (value.charCodeAt(index) === 45 /* `-` */) {
      const code = value.charCodeAt(index + 1)

      // Exit if this isn’t an extension.
      if (
        code === 120 /* `x` */ ||
        !isAlphanumerical(code) ||
        value.charCodeAt(index + 2) !== 45 /* `-` */ ||
        !isAlphanumerical(value.charCodeAt(index + 3))
      ) {
        break
      }

      // Alphanumerical and not `x`, so a singleton.
      const name = /** @type {Singleton} */ (value.charAt(index + 1))
      let offset = index + 2
      /** @type {Array<string>} */
      const subtags = []

      while (
        value.charCodeAt(offset) === 45 /* `-` */ &&
        isAlphanumerical(value.charCodeAt(offset + 1)) &&
        isAlphanumerical(value.charCodeAt(offset + 2))
      ) {
        const start = offset + 1
        const end = subtagEnd(start)

        if (end - start > 8 /* Max extension. */) {
          return fail(
            'extension-too-long',
            start,
            end,
            'Unexpected extension subtag `' +
              tag.slice(start, end) +
              '` of ' +
              (end - start) +
              ' characters, expected at most 8 characters'
          )
        }

        subtags.push(value.slice(start, end))
        offset = end
      }

      if (subtags.length === 0) {
        return fail(
          'extension-empty',
          index + 1,
          index + 2,
          'Unexpected empty extension `' +
            tag.charAt(index + 1) +
            '`, expected a subtag of 2 to 8 characters after the singleton'
        )
      }

      if (extensions.some((d) => d.singleton === name)) {
        emit(
          'singleton-duplicate',
          index + 1,
          index + 2,
          'Unexpected duplicate singleton `' +
            tag.charAt(index + 1) +
            '`, expected each singleton at most once'
        )
      }

      extensions.push({extensions: subtags, singleton: name})
      index = offset
    }
  }
  // Not a language.
  else {
    index = 0
  }

  // Private-use.
  if (
    (index === 0 && value.charCodeAt(index) === 120) /* `x` */ ||
    (value.charCodeAt(index) === 45 /* `-` */ &&
      value.charCodeAt(index + 1) === 120) /* `x` */
  ) {
    const singletonStart = index ? index + 1 : 0
    index = singletonStart + 1

    while (
      value.charCodeAt(index) === 45 /* `-` */ &&
      isAlphanumerical(value.charCodeAt(index + 1))
    ) {
      const start = index + 1
      const end = subtagEnd(start)

      if (end - start > 8 /* Max private-use. */) {
        return fail(
          'private-use-too-long',
          start,
          end,
          'Unexpected private-use subtag `' +
            tag.slice(start, end) +
            '` of ' +
            (end - start) +
            ' characters, expected at most 8 characters'
        )
      }

      privateuse.push(value.slice(start, end))
      index = end
    }

    if (privateuse.length === 0) {
      return fail(
        'private-use-empty',
        singletonStart,
        singletonStart + 1,
        'Unexpected empty private-use `' +
          tag.charAt(singletonStart) +
          '`, expected a subtag of 1 to 8 characters after the singleton'
      )
    }
  }

  if (index !== tag.length) {
    return fail(
      'tag-unexpected-content',
      index,
      tag.length,
      'Unexpected content `' + tag.slice(index) + '`, expected end of tag'
    )
  }

  return build()

  /**
   * Find the end of the alphanumericals starting at `start`.
   *
   * @param {number} start
   *   Index of the first character.
   * @returns {number}
   *   Index after the last alphanumerical.
   */
  function subtagEnd(start) {
    let end = start
    while (isAlphanumerical(value.charCodeAt(end))) end++
    return end
  }

  /**
   * Stop.
   *
   * @param {RuleId} ruleId
   *   Category of the message.
   * @param {number} start
   *   Index of the first reported character.
   * @param {number} end
   *   Index after the last reported character.
   * @param {string} reason
   *   Reason for the message, in English.
   * @returns {Schema | undefined}
   *   Partial result in forgiving mode, `undefined` otherwise.
   */
  function fail(ruleId, start, end, reason) {
    emit(ruleId, start, end, reason)
    return settings.forgiving ? build() : undefined
  }

  /**
   * Emit a message.
   *
   * @param {RuleId} ruleId
   *   Category of the message.
   * @param {number} start
   *   Index of the first reported character.
   * @param {number} end
   *   Index after the last reported character.
   * @param {string} reason
   *   Reason for the message, in English.
   * @returns {undefined}
   *   Nothing.
   */
  function emit(ruleId, start, end, reason) {
    if (!settings.onmessage) return

    const fatal =
      ruleId !== 'singleton-duplicate' && ruleId !== 'variant-duplicate'
    settings.onmessage({
      actual: tag.slice(start, end),
      fatal,
      range: [start, end],
      reason,
      ruleId,
      source: 'bcp-47'
    })
  }

  /**
   * Create a schema from what was found.
   *
   * @returns {Schema | undefined}
   *   Schema, or `undefined` when nothing was found.
   */
  function build() {
    if (language) {
      return {
        extendedLanguageSubtags,
        extensions,
        language,
        privateuse,
        region,
        script,
        type: 'language',
        variants
      }
    }

    if (privateuse.length === 0) return
    const [first, ...rest] = privateuse
    return {privateuse: [first, ...rest], type: 'privateuse'}
  }
}

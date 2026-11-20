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
 * @property {[]} extendedLanguageSubtags
 *   Extended language subtags (none).
 * @property {[]} extensions
 *   Extensions (none).
 * @property {Irregular} irregular
 *   Irregular legacy tag, such as `i-default`.
 * @property {null} language
 *   Language (none).
 * @property {[]} privateuse
 *   Private-use subtags (none).
 * @property {null} region
 *   Region (none).
 * @property {null} regular
 *   Regular legacy tag (none).
 * @property {null} script
 *   Script (none).
 * @property {'irregular'} type
 *   Kind of tag.
 * @property {[]} variants
 *   Variants (none).
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
 * @property {null} irregular
 *   Irregular legacy tag (none).
 * @property {string} language
 *   ISO 639 language code or registered language subtag,
 *   such as `en` or `cmn`.
 * @property {Array<string>} privateuse
 *   Private-use subtags, such as `foo` in `en-x-foo`.
 * @property {string | null} region
 *   ISO 3166-1 or UN M49 code,
 *   such as `CN` in `cmn-Hans-CN` or `419` in `es-419`.
 * @property {null} regular
 *   Regular legacy tag (none).
 * @property {string | null} script
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
 * @typedef MutableSchema
 *   Schema while parsing (internal).
 * @property {Array<string>} extendedLanguageSubtags
 *   Extended language subtags found so far.
 * @property {Array<Extension>} extensions
 *   Extensions found so far.
 * @property {Irregular | null} irregular
 *   Irregular legacy tag, if found.
 * @property {string | null} language
 *   Language, if found.
 * @property {Array<string>} privateuse
 *   Private-use subtags found so far.
 * @property {string | null} region
 *   Region, if found.
 * @property {Regular | null} regular
 *   Regular legacy tag, if found.
 * @property {string | null} script
 *   Script, if found.
 * @property {Schema['type']} type
 *   Kind of tag found so far.
 * @property {Array<string>} variants
 *   Variants found so far.
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
 *   instead of returning an empty schema (default: `false`).
 * @property {boolean | null | undefined} [normalize=true]
 *   Replace deprecated tags with their preferred value,
 *   such as `i-klingon` with `tlh` (default: `true`).
 * @property {OnMessage | null | undefined} [onmessage]
 *   Called when a problem is found (optional).
 */

/**
 * @typedef PrivateUseSchema
 *   Parsed private-use tag, or an empty schema.
 * @property {[]} extendedLanguageSubtags
 *   Extended language subtags (none).
 * @property {[]} extensions
 *   Extensions (none).
 * @property {null} irregular
 *   Irregular legacy tag (none).
 * @property {null} language
 *   Language (none).
 * @property {Array<string>} privateuse
 *   Private-use subtags, such as `foo` in `x-foo`;
 *   empty when nothing was parsed.
 * @property {null} region
 *   Region (none).
 * @property {null} regular
 *   Regular legacy tag (none).
 * @property {null} script
 *   Script (none).
 * @property {'privateuse'} type
 *   Kind of tag.
 * @property {[]} variants
 *   Variants (none).
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
 * @property {[]} extendedLanguageSubtags
 *   Extended language subtags (none).
 * @property {[]} extensions
 *   Extensions (none).
 * @property {null} irregular
 *   Irregular legacy tag (none).
 * @property {null} language
 *   Language (none).
 * @property {[]} privateuse
 *   Private-use subtags (none).
 * @property {null} region
 *   Region (none).
 * @property {Regular} regular
 *   Regular legacy tag, such as `zh-min`.
 * @property {null} script
 *   Script (none).
 * @property {'regular'} type
 *   Kind of tag.
 * @property {[]} variants
 *   Variants (none).
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
 *   Check `type` to find out which kind of tag it is;
 *   an empty schema is a private-use schema without subtags.
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

const own = {}.hasOwnProperty

/**
 * Parse a BCP 47 language tag.
 *
 * > 👉 **Note**:
 * > the algorithm is case insensitive.
 * > Legacy tags and singletons are returned in their canonical casing,
 * > other subtags in the casing they were given in.
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

    result.irregular = irregular.find((d) => d.toLowerCase() === value) || null
    result.regular = regular.find((d) => d === value) || null
    result.type = result.irregular ? 'irregular' : 'regular'

    return /** @type {Schema} */ (result)
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
    result.type = 'language'

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
              source.slice(index + 1, index + 4) +
              '`, expected at most 3 extended language subtags'
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
      const end = subtagEnd(start)
      const size = end - start

      if (size > 8 /* Max variant. */) {
        return fail(
          'variant-too-long',
          start,
          end,
          'Unexpected variant `' +
            source.slice(start, end) +
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

        if (result.variants.some((d) => d.toLowerCase() === variant)) {
          emit(
            'variant-duplicate',
            start,
            end,
            'Unexpected duplicate variant `' +
              source.slice(start, end) +
              '`, expected each variant at most once'
          )
        }

        result.variants.push(source.slice(start, end))
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
      const extensions = []

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
              source.slice(start, end) +
              '` of ' +
              (end - start) +
              ' characters, expected at most 8 characters'
          )
        }

        extensions.push(source.slice(start, end))
        offset = end
      }

      if (extensions.length === 0) {
        return fail(
          'extension-empty',
          index + 1,
          index + 2,
          'Unexpected empty extension `' +
            source.charAt(index + 1) +
            '`, expected a subtag of 2 to 8 characters after the singleton'
        )
      }

      if (result.extensions.some((d) => d.singleton === name)) {
        emit(
          'singleton-duplicate',
          index + 1,
          index + 2,
          'Unexpected duplicate singleton `' +
            source.charAt(index + 1) +
            '`, expected each singleton at most once'
        )
      }

      result.extensions.push({extensions, singleton: name})
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
            source.slice(start, end) +
            '` of ' +
            (end - start) +
            ' characters, expected at most 8 characters'
        )
      }

      result.privateuse.push(source.slice(start, end))
      index = end
    }

    if (result.privateuse.length === 0) {
      return fail(
        'private-use-empty',
        singletonStart,
        singletonStart + 1,
        'Unexpected empty private-use `' +
          source.charAt(singletonStart) +
          '`, expected a subtag of 1 to 8 characters after the singleton'
      )
    }
  }

  if (index !== source.length) {
    return fail(
      'tag-unexpected-content',
      index,
      source.length,
      'Unexpected content `' + source.slice(index) + '`, expected end of tag'
    )
  }

  return /** @type {Schema} */ (result)

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
   * @returns {Schema}
   *   Partial result in forgiving mode, empty result otherwise.
   */
  function fail(ruleId, start, end, reason) {
    emit(ruleId, start, end, reason)
    return /** @type {Schema} */ (settings.forgiving ? result : empty())
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
      actual: source.slice(start, end),
      fatal,
      range: [start, end],
      reason,
      ruleId,
      source: 'bcp-47'
    })
  }
}

/**
 * Create an empty results object.
 *
 * @returns {MutableSchema}
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
    type: 'privateuse',
    variants: []
  }
}

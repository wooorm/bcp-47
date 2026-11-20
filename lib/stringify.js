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

/**
 * Compile a language schema to a BCP 47 language tag.
 *
 * @param {SchemaInput | null | undefined} [schema]
 *   Tag to serialize (optional).
 * @returns {string}
 *   BCP 47 language tag.
 */
export function stringify(schema) {
  if (!schema) {
    return ''
  }

  if (schema.type === 'irregular' || schema.type === 'regular') {
    return schema.value
  }

  /** @type {Array<string>} */
  let result = []

  if (schema.type === 'language' && schema.language) {
    // eslint-disable-next-line unicorn/prefer-spread
    result = result.concat(
      schema.language,
      schema.extendedLanguageSubtags || [],
      schema.script || [],
      schema.region || [],
      schema.variants || []
    )

    const values = schema.extensions || []
    let index = -1

    while (++index < values.length) {
      const value = values[index]

      if (value.singleton && value.extensions && value.extensions.length > 0) {
        result.push(value.singleton, ...value.extensions)
      }
    }
  }

  if (schema.privateuse && schema.privateuse.length > 0) {
    result.push('x', ...schema.privateuse)
  }

  return result.join('-')
}

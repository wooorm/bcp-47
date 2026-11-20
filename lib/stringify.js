/**
 * @import {
 *   Irregular,
 *   IrregularSchema,
 *   LanguageSchema,
 *   PrivateUseSchema,
 *   Regular,
 *   RegularSchema
 * } from './parse.js'
 */

/**
 * @typedef {(
 *   (Partial<IrregularSchema> & {irregular: Irregular}) |
 *   (Partial<LanguageSchema> & {language: string}) |
 *   Partial<PrivateUseSchema> |
 *   (Partial<RegularSchema> & {regular: Regular})
 * )} SchemaInput
 *   Tag to serialize.
 *
 *   Like `Schema`, but fields without a value can be omitted.
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
  const info = schema || {}

  if (info.irregular) {
    return info.irregular
  }

  if (info.regular) {
    return info.regular
  }

  /** @type {Array<string>} */
  let result = []

  if (info.language) {
    // eslint-disable-next-line unicorn/prefer-spread
    result = result.concat(
      info.language,
      info.extendedLanguageSubtags || [],
      info.script || [],
      info.region || [],
      info.variants || []
    )

    const values = info.extensions || []
    let index = -1

    while (++index < values.length) {
      const value = values[index]

      if (value.singleton && value.extensions && value.extensions.length > 0) {
        result.push(value.singleton, ...value.extensions)
      }
    }
  }

  if (info.privateuse && info.privateuse.length > 0) {
    result.push('x', ...info.privateuse)
  }

  return result.join('-')
}

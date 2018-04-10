'use strict'

module.exports = stringify

/* Compile a language schema to a BCP 47 language tag. */
function stringify(schema) {
  var result = []
  var values
  var index
  var value
  var length

  if (schema && (schema.irregular || schema.regular)) {
    return schema.irregular || schema.regular
  }

  if (schema && schema.language) {
    result = result.concat(
      schema.language,
      schema.extendedLanguageSubtags || [],
      schema.script || [],
      schema.region || [],
      schema.variants || []
    )

    values = schema.extensions || []
    index = -1
    length = values.length

    while (++index < length) {
      value = values[index]

      if (
        value.singleton &&
        value.extensions &&
        value.extensions.length !== 0
      ) {
        result = result.concat(value.singleton, value.extensions)
      }
    }
  }

  if (schema && schema.privateuse && schema.privateuse.length !== 0) {
    result = result.concat('x', schema.privateuse)
  }

  return result.join('-')
}

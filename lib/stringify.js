'use strict';

module.exports = stringify;

/* Characters. */
var C_DASH = '-';
var C_X_LOWER = 'x';

/* Compile a language schema to a BCP 47 language tag. */
function stringify(schema) {
  var result = [];
  var values;
  var index;
  var value;
  var length;

  if (schema && (schema.irregular || schema.regular)) {
    return schema.irregular || schema.regular;
  }

  if (schema && schema.language) {
    result = result.concat(
      schema.language,
      schema.extendedLanguageSubtags || [],
      schema.script || [],
      schema.region || [],
      schema.variants || []
    );

    values = schema.extensions || [];
    index = -1;
    length = values.length;

    while (++index < length) {
      value = values[index];

      if (
        value.singleton &&
        value.extensions &&
        value.extensions.length
      ) {
        result = result.concat(value.singleton, value.extensions);
      }
    }
  }

  if (schema && schema.privateuse && schema.privateuse.length) {
    result = result.concat(C_X_LOWER, schema.privateuse);
  }

  return result.join(C_DASH);
}

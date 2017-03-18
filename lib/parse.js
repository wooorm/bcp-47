/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module bcp-47:parse
 * @fileoverview Parse BCP 47 language tags.
 */

'use strict';

/* Dependencies. */
var has = require('has');
var alphanumeric = require('is-alphanumerical');
var alphabetical = require('is-alphabetical');
var decimal = require('is-decimal');
var regular = require('./regular');
var normal = require('./normalize');

/* Expose. */
module.exports = parse;

/* Characters. */
var C_DASH = '-';
var C_X_LOWER = 'x';

/* Character codes. */
var CC_DASH = C_DASH.charCodeAt(0);
var CC_X_LOWER = C_X_LOWER.charCodeAt(0);

/* Constants. */
var MAX_SUBTAG = 8;
var MAX_RESERVED = 4;
var MAX_ISO_639 = 3;
var MIN_ISO_639 = 2;
var MAX_EXTENDED_LANGUAGE_SUBTAG_COUNT = 3;
var MAX_VARIANT = 8;
var MIN_ALPHANUMERIC_VARIANT = 5;
var MIN_VARIANT = 4;
var MAX_EXTENSION = 8;
var MAX_PRIVATE_USE = 8;

/* Error codes. */
var ERR_VARIANT_TOO_LONG = 1;
var ERR_EXTENSION_TOO_LONG = 2;
var ERR_TOO_MANY_SUBTAGS = 3;
var ERR_EMPTY_EXTENSION = 4;
var ERR_PRIVATE_USE_TOO_LONG = 5;
var ERR_EXTRA_CONTENT = 6;

/* Error codes to messages. */
var ERRORS = {};

ERRORS[ERR_VARIANT_TOO_LONG] = 'Too long variant, expected at most 8 ' +
  'characters';

ERRORS[ERR_EXTENSION_TOO_LONG] = 'Too long extension, expected at most ' +
  '8 characters';

ERRORS[ERR_TOO_MANY_SUBTAGS] = 'Too many extended language subtags, ' +
  'expected at most 3 subtags';

ERRORS[ERR_EMPTY_EXTENSION] = 'Empty extension, extensions must have ' +
  'at least 2 characters of content';

ERRORS[ERR_PRIVATE_USE_TOO_LONG] = 'Too long private-use area, ' +
  'expected at most 8 characters';

ERRORS[ERR_EXTRA_CONTENT] = 'Found superfluous content after tag';

/**
 * Check if `code` is `x` (lower-case).
 *
 * @param {number} code - Code to check.
 * @return {boolean} - If `code` is `x`.
 */
function x(code) {
  return code === CC_X_LOWER;
}

/**
 * Check if `code` is `-`.
 *
 * @param {number} code - Code to check.
 * @return {boolean} - If `code` is `-`.
 */
function dash(code) {
  return code === CC_DASH;
}

/**
 * Create an empty results object.
 *
 * @return {Object} - Results object.
 */
function empty() {
  return {
    language: null,
    extendedLanguageSubtags: [],
    script: null,
    region: null,
    variants: [],
    extensions: [],
    privateuse: [],
    irregular: null,
    regular: null
  };
}

/**
 * Parse a BCP 47 language tag.
 *
 * @param {string} tag - Language tag to parse.
 * @param {Object} [options={}] - Configuration.
 * @param {number} [options.offset=0] - Offset.
 * @return {Object} - Results.
 * @throws {Error} - When `tag` is `null` or `undefined`.
 */
function parse(tag, options) {
  var settings = options || {};
  var warning = settings.warning;
  var forgiving = settings.forgiving;
  var normalize = settings.normalize == null ? true : settings.normalize;
  var result = {};
  var sensitive;
  var code;
  var index;
  var count;
  var groupCount;
  var offset;

  /* Check input. */
  if (tag == null) {
    throw new Error('Expected string, got `' + tag + '`');
  }

  /**
   * Get the character code at `pos`.
   */
  function char(pos) {
    return tag.charCodeAt(pos);
  }

  /**
   * Fail.
   */
  function fail(offset, code) {
    if (warning) {
      warning(ERRORS[code], code, offset);
    }

    return forgiving ? result : empty();
  }

  result = empty();

  /* Let’s start. */
  tag = String(tag);
  sensitive = tag;
  tag = tag.toLowerCase();

  if (has(normal, tag)) {
    if (normalize && normal[tag]) {
      return parse(normal[tag]);
    }

    result[regular.indexOf(tag) === -1 ? 'irregular' : 'regular'] = sensitive;

    return result;
  }

  index = 0;
  code = char(index);

  while (alphabetical(code)) {
    index++;
    code = char(index);
  }

  /* Parse a normal tag. */
  if (index < MIN_ISO_639 || index > MAX_SUBTAG) {
    index = 0;
  } else {
    if (index > MAX_RESERVED) {
      // Subtag language.
      result.language = sensitive.slice(0, index);
    } else if (index > MAX_ISO_639) {
      // Reserved language.
      result.language = sensitive.slice(0, index);
    } else {
      groupCount = 0;

      // ISO 639 language.
      result.language = sensitive.slice(0, index);

      while (
        dash(char(index)) &&
        alphabetical(char(index + 1)) &&
        alphabetical(char(index + 2)) &&
        alphabetical(char(index + 3)) &&
        !alphabetical(char(index + 4))
      ) {
        if (groupCount >= MAX_EXTENDED_LANGUAGE_SUBTAG_COUNT) {
          return fail(index, ERR_TOO_MANY_SUBTAGS);
        }

        // Extended language subtag.
        result.extendedLanguageSubtags.push(
          sensitive.slice(index + 1, index + 4)
        );

        index += 4;
        groupCount++;
      }
    }

    if (
        dash(char(index)) &&
        alphabetical(char(index + 1)) &&
        alphabetical(char(index + 2)) &&
        alphabetical(char(index + 3)) &&
        alphabetical(char(index + 4)) &&
        !alphabetical(char(index + 5))
    ) {
      // ISO 15924 script.
      result.script = sensitive.slice(index + 1, index + 5);

      index += 5;
    }

    if (dash(char(index))) {
      if (
        alphabetical(char(index + 1)) &&
        alphabetical(char(index + 2)) &&
        !alphabetical(char(index + 3))
      ) {
        // ISO 3166-1 region.
        result.region = sensitive.slice(index + 1, index + 3);
        index += 3;
      } else if (
        decimal(char(index + 1)) &&
        decimal(char(index + 2)) &&
        decimal(char(index + 3)) &&
        !decimal(char(index + 4))
      ) {
        // UN M49 region.
        result.region = sensitive.slice(index + 1, index + 4);
        index += 4;
      }
    }

    while (dash(char(index))) {
      offset = index + 1;
      count = 0;

      while (alphanumeric(char(offset))) {
        offset++;
        count++;

        if (count > MAX_VARIANT) {
          return fail(offset, ERR_VARIANT_TOO_LONG);
        }
      }

      if (count >= MIN_ALPHANUMERIC_VARIANT) {
        // Long variant.
        result.variants.push(sensitive.slice(index + 1, offset));
        index = offset;
      } else if (
        decimal(char(index + 1)) &&
        count >= MIN_VARIANT
      ) {
        // Short variant.
        result.variants.push(sensitive.slice(index + 1, offset));
        index = offset;
      } else {
        break;
      }
    }

    while (dash(char(index))) {
      if (
        x(char(index + 1)) ||
        !alphanumeric(char(index + 1)) ||
        !dash(char(index + 2)) ||
        !alphanumeric(char(index + 3))
      ) {
        break;
      }

      offset = index + 2;
      groupCount = 0;

      while (
        dash(char(offset)) &&
        alphanumeric(char(offset + 1)) &&
        alphanumeric(char(offset + 2))
      ) {
        offset += 2;
        count = 2;
        groupCount++;

        while (alphanumeric(char(offset))) {
          if (count > MAX_EXTENSION) {
            return fail(offset, ERR_EXTENSION_TOO_LONG);
          }

          offset++;
          count++;
        }
      }

      if (!groupCount) {
        return fail(offset, ERR_EMPTY_EXTENSION);
      }

      // Extension.
      result.extensions.push({
        singleton: sensitive.charAt(index + 1),
        extensions: sensitive.slice(index + 3, offset).split(C_DASH)
      });

      index = offset;
    }
  }

  if (
    (index === 0 && x(char(0))) ||
    (index !== 1 && dash(char(index)) && x(char(index + 1)))
  ) {
    index = index ? index + 2 : 1;
    offset = index;

    while (
      dash(char(offset)) &&
      alphanumeric(char(offset + 1))
    ) {
      offset += 2;
      count = 1;

      while (alphanumeric(char(offset))) {
        if (count >= MAX_PRIVATE_USE) {
          return fail(offset, ERR_PRIVATE_USE_TOO_LONG);
        }

        offset++;
        count++;
      }

      result.privateuse.push(sensitive.slice(index + 1, offset));
      index = offset;
    }
  }

  if (index !== tag.length) {
    return fail(index, ERR_EXTRA_CONTENT);
  }

  return result;
}

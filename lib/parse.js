'use strict'

var alphanumeric = require('is-alphanumerical')
var alphabetical = require('is-alphabetical')
var decimal = require('is-decimal')
var regular = require('./regular')
var normal = require('./normalize')

module.exports = parse

var own = {}.hasOwnProperty

var maxSubtag = 8
var maxReserved = 4
var maxIso639 = 3
var minIso639 = 2
var maxExtendedLanguageSubtagCount = 3
var maxVariant = 8
var minAlphanumericVariant = 5
var minVariant = 4
var maxExtension = 8
var maxPrivateUse = 8

var errVariantTooLong = 1
var errExtensionTooLong = 2
var errTooManySubtags = 3
var errEmptyExtension = 4
var errPrivateUseTooLong = 5
var errExtraContent = 6

var errors = {}

errors[errVariantTooLong] = 'Too long variant, expected at most 8 characters'
errors[errExtensionTooLong] =
  'Too long extension, expected at most 8 characters'
errors[errTooManySubtags] =
  'Too many extended language subtags, expected at most 3 subtags'
errors[errEmptyExtension] =
  'Empty extension, extensions must have at least 2 characters of content'
errors[errPrivateUseTooLong] =
  'Too long private-use area, expected at most 8 characters'
errors[errExtraContent] = 'Found superfluous content after tag'

// Parse a BCP 47 language tag.
/* eslint-disable complexity */
function parse(tag, options) {
  var settings = options || {}
  var warning = settings.warning
  var forgiving = settings.forgiving
  var normalize = settings.normalize
  var result = {}
  var sensitive
  var code
  var index
  var count
  var groupCount
  var offset

  // Check input.
  if (tag === null || tag === undefined) {
    throw new Error('Expected string, got `' + tag + '`')
  }

  normalize = normalize === null || normalize === undefined ? true : normalize

  // Let’s start.
  result = empty()
  tag = String(tag)
  sensitive = tag
  tag = tag.toLowerCase()

  if (own.call(normal, tag)) {
    if (normalize && normal[tag]) {
      return parse(normal[tag])
    }

    result[regular.indexOf(tag) === -1 ? 'irregular' : 'regular'] = sensitive

    return result
  }

  index = 0
  code = char(index)

  while (alphabetical(code)) {
    index++
    code = char(index)
  }

  // Parse a normal tag.
  if (index < minIso639 || index > maxSubtag) {
    index = 0
  } else {
    if (index > maxReserved) {
      // Subtag language.
      result.language = sensitive.slice(0, index)
    } else if (index > maxIso639) {
      // Reserved language.
      result.language = sensitive.slice(0, index)
    } else {
      groupCount = 0

      // ISO 639 language.
      result.language = sensitive.slice(0, index)

      while (
        dash(char(index)) &&
        alphabetical(char(index + 1)) &&
        alphabetical(char(index + 2)) &&
        alphabetical(char(index + 3)) &&
        !alphabetical(char(index + 4))
      ) {
        if (groupCount >= maxExtendedLanguageSubtagCount) {
          return fail(index, errTooManySubtags)
        }

        // Extended language subtag.
        result.extendedLanguageSubtags.push(
          sensitive.slice(index + 1, index + 4)
        )

        index += 4
        groupCount++
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
      result.script = sensitive.slice(index + 1, index + 5)

      index += 5
    }

    if (dash(char(index))) {
      if (
        alphabetical(char(index + 1)) &&
        alphabetical(char(index + 2)) &&
        !alphabetical(char(index + 3))
      ) {
        // ISO 3166-1 region.
        result.region = sensitive.slice(index + 1, index + 3)
        index += 3
      } else if (
        decimal(char(index + 1)) &&
        decimal(char(index + 2)) &&
        decimal(char(index + 3)) &&
        !decimal(char(index + 4))
      ) {
        // UN M49 region.
        result.region = sensitive.slice(index + 1, index + 4)
        index += 4
      }
    }

    while (dash(char(index))) {
      offset = index + 1
      count = 0

      while (alphanumeric(char(offset))) {
        offset++
        count++

        if (count > maxVariant) {
          return fail(offset, errVariantTooLong)
        }
      }

      if (count >= minAlphanumericVariant) {
        // Long variant.
        result.variants.push(sensitive.slice(index + 1, offset))
        index = offset
      } else if (decimal(char(index + 1)) && count >= minVariant) {
        // Short variant.
        result.variants.push(sensitive.slice(index + 1, offset))
        index = offset
      } else {
        break
      }
    }

    while (dash(char(index))) {
      if (
        x(char(index + 1)) ||
        !alphanumeric(char(index + 1)) ||
        !dash(char(index + 2)) ||
        !alphanumeric(char(index + 3))
      ) {
        break
      }

      offset = index + 2
      groupCount = 0

      while (
        dash(char(offset)) &&
        alphanumeric(char(offset + 1)) &&
        alphanumeric(char(offset + 2))
      ) {
        offset += 2
        count = 2
        groupCount++

        while (alphanumeric(char(offset))) {
          if (count > maxExtension) {
            return fail(offset, errExtensionTooLong)
          }

          offset++
          count++
        }
      }

      if (!groupCount) {
        return fail(offset, errEmptyExtension)
      }

      // Extension.
      result.extensions.push({
        singleton: sensitive.charAt(index + 1),
        extensions: sensitive.slice(index + 3, offset).split('-')
      })

      index = offset
    }
  }

  if (
    (index === 0 && x(char(0))) ||
    (index !== 1 && dash(char(index)) && x(char(index + 1)))
  ) {
    index = index ? index + 2 : 1
    offset = index

    while (dash(char(offset)) && alphanumeric(char(offset + 1))) {
      offset += 2
      count = 1

      while (alphanumeric(char(offset))) {
        if (count >= maxPrivateUse) {
          return fail(offset, errPrivateUseTooLong)
        }

        offset++
        count++
      }

      result.privateuse.push(sensitive.slice(index + 1, offset))
      index = offset
    }
  }

  if (index !== tag.length) {
    return fail(index, errExtraContent)
  }

  return result

  function char(pos) {
    return tag.charCodeAt(pos)
  }

  function fail(offset, code) {
    if (warning) {
      warning(errors[code], code, offset)
    }

    return forgiving ? result : empty()
  }
}
/* eslint-enable complexity */

// Check if `code` is `x` (lower-case).
function x(code) {
  return code === 120 // 'x'
}

// Check if `code` is `-`.
function dash(code) {
  return code === 45 // '-'
}

// Create an empty results object.
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
  }
}

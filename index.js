/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module bcp-47
 * @fileoverview Parse and stringify BCP 47 language tags.
 */

'use strict';

/* eslint-env commonjs */

/*
 * Methods.
 */

var has = {}.hasOwnProperty;

/*
 * Characters.
 */

var C_DASH = '-';
var C_X_LOWER = 'x';

/*
 * Character codes.
 */

var CC_DASH = C_DASH.charCodeAt(0);
var CC_X_LOWER = C_X_LOWER.charCodeAt(0);
var CC_A_LOWER = 'a'.charCodeAt(0);
var CC_Z_LOWER = 'z'.charCodeAt(0);
var CC_0 = '0'.charCodeAt(0);
var CC_9 = '9'.charCodeAt(0);

/*
 * Constants.
 */

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

/*
 * Error codes.
 */

var ERR_CODE_VARIANT_TOO_LONG = 1;
var ERR_CODE_EXTENSION_TOO_LONG = 2;
var ERR_CODE_TOO_MANY_SUBTAGS = 3;
var ERR_CODE_EMPTY_EXTENSION = 4;
var ERR_CODE_PRIVATE_USE_TOO_LONG = 5;
var ERR_CODE_EXTRA_CONTENT = 6;

/*
 * Error codes to messages.
 */

var ERRORS = {};

ERRORS[ERR_CODE_VARIANT_TOO_LONG] = 'Too long variant, expected at most 8 ' +
    'characters';

ERRORS[ERR_CODE_EXTENSION_TOO_LONG] = 'Too long extension, expected at most ' +
    '8 characters';

ERRORS[ERR_CODE_TOO_MANY_SUBTAGS] = 'Too many extended language subtags, ' +
    'expected at most 3 subtags';

ERRORS[ERR_CODE_EMPTY_EXTENSION] = 'Empty extension, extensions must have ' +
    'at least 2 characters of content';

ERRORS[ERR_CODE_PRIVATE_USE_TOO_LONG] = 'Too long private-use area, ' +
    'expected at most 8 characters';

ERRORS[ERR_CODE_EXTRA_CONTENT] = 'Found superfluous content after tag';

/*
 * Regular tags.
 * List of regular tags which *are* “well-formed” but
 * mean something else.
 */

var REGULAR = [
    'art-lojban',
    'cel-gaulish',
    'no-bok',
    'no-nyn',
    'zh-guoyu',
    'zh-hakka',
    'zh-min',
    'zh-min-nan',
    'zh-xiang'
];

/**
 * Map or irregular and regular tags to their modern
 * language tags.
 *
 * The regular tags are included above, but as all other
 * tags in the below map are not, they’re thus irregular.
 */

var NORMALIZE = {
    'en-gb-oed': 'en-GB-oxendict',
    'i-ami': 'ami',
    'i-bnn': 'bnn',
    'i-default': null,
    'i-enochian': null,
    'i-hak': 'hak',
    'i-klingon': 'tlh',
    'i-lux': 'lb',
    'i-mingo': null,
    'i-navajo': 'nv',
    'i-pwn': 'pwn',
    'i-tao': 'tao',
    'i-tay':'tay',
    'i-tsu': 'tsu',
    'sgn-be-fr': 'sfb',
    'sgn-be-nl': 'vgt',
    'sgn-ch-de': 'sgg',
    'art-lojban': 'jbo',
    'cel-gaulish': null,
    'no-bok': 'nb',
    'no-nyn': 'nn',
    'zh-guoyu': 'cmn',
    'zh-hakka': 'hak',
    'zh-min': null,
    'zh-min-nan': 'nan',
    'zh-xiang': 'hsn'
};

/**
 * Check if `code` is numeric.
 *
 * @param {number} code - Code to check.
 * @return {boolean} - If `code` is numeric.
 */
function numeric(code) {
    return code >= CC_0 && code <= CC_9;
}

/**
 * Check if `code` is alphabetic (lower-case).
 *
 * @param {number} code - Code to check.
 * @return {boolean} - If `code` is alphabetic.
 */
function alphabetic(code) {
    return code >= CC_A_LOWER && code <= CC_Z_LOWER;
}

/**
 * Check if `code` is alphanumeric (case-insensitive).
 *
 * @param {number} code - Code to check.
 * @return {boolean} - If `code` is alphanumeric.
 */
function alphanumeric(code) {
    return numeric(code) || alphabetic(code);
}

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
        'language': null,
        'extendedLanguageSubtags': [],
        'script': null,
        'region': null,
        'variants': [],
        'extensions': [],
        'privateuse': [],
        'irregular': null,
        'regular': null
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
    var normalize = settings.normalize;
    var result = {};
    var sensitive;
    var code;
    var index;
    var count;
    var groupCount;
    var offset;

    if (normalize === null || normalize === undefined) {
        normalize = true;
    }

    /*
     * Check input.
     */

    if (tag === null || tag === undefined) {
        throw new Error('Expected string, got `' + tag + '`');
    }

    /**
     * Get the character code at `pos`.
     *
     * @param {number} pos - Character position.
     * @return {number} - Character code.
     */
    function char(pos) {
        return tag.charCodeAt(pos);
    }

    /**
     * Fail.
     *
     * @param {number} offset - Position of fail.
     * @param {number} code - Code for reason of fail.
     * @return {Object} - An empty result when not
     *   forgiving, or the object until the failure
     *   otherwise.
     */
    function fail(offset, code) {
        if (warning) {
            warning(ERRORS[code], code, offset);
        }

        return forgiving ? result : empty();
    }

    result = empty();

    /*
     * Let’s start.
     */

    tag = String(tag);
    sensitive = tag;
    tag = tag.toLowerCase();

    if (has.call(NORMALIZE, tag)) {
        if (normalize && NORMALIZE[tag]) {
            return parse(NORMALIZE[tag]);
        }

        result[
            REGULAR.indexOf(tag) === -1 ? 'irregular' : 'regular'
        ] = sensitive;

        return result;
    }

    index = 0;
    code = char(index);

    while (alphabetic(code)) {
        index++;
        code = char(index);
    }

    /*
     * Parse a normal tag.
     */

    if (index < MIN_ISO_639 || index > MAX_SUBTAG) {
        index = 0;
    } else {
        if (index > MAX_RESERVED) {
            // lang(subtag):
            result.language = sensitive.slice(0, index);
        } else if (index > MAX_ISO_639) {
            // lang(reserved):
            result.language = sensitive.slice(0, index);
        } else {
            groupCount = 0;

            // lang(iso-639):
            result.language = sensitive.slice(0, index);

            while (
                dash(char(index)) &&
                alphabetic(char(index + 1)) &&
                alphabetic(char(index + 2)) &&
                alphabetic(char(index + 3)) &&
                !alphabetic(char(index + 4))
            ) {
                if (groupCount >= MAX_EXTENDED_LANGUAGE_SUBTAG_COUNT) {
                    return fail(index, ERR_CODE_TOO_MANY_SUBTAGS);
                }

                // extended lang subtag
                result.extendedLanguageSubtags.push(
                    sensitive.slice(index + 1, index + 4)
                );

                index = index + 4;
                groupCount++;
            }
        }

        if (
            dash(char(index)) &&
            alphabetic(char(index + 1)) &&
            alphabetic(char(index + 2)) &&
            alphabetic(char(index + 3)) &&
            alphabetic(char(index + 4)) &&
            !alphabetic(char(index + 5))
        ) {
            // script(iso-15924):
            result.script = sensitive.slice(index + 1, index + 5);

            index += 5;
        }

        if (dash(char(index))) {
            if (
                alphabetic(char(index + 1)) &&
                alphabetic(char(index + 2)) &&
                !alphabetic(char(index + 3))
            ) {
                // region(iso-3166-1):
                result.region = sensitive.slice(index + 1, index + 3);
                index += 3;
            } else if (
                numeric(char(index + 1)) &&
                numeric(char(index + 2)) &&
                numeric(char(index + 3)) &&
                !numeric(char(index + 4))
            ) {
                // region(un-m49):
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
                    return fail(offset, ERR_CODE_VARIANT_TOO_LONG);
                }
            }

            if (count >= MIN_ALPHANUMERIC_VARIANT) {
                // variant(long):
                result.variants.push(
                    sensitive.slice(index + 1, offset)
                );

                index = offset;
            } else if (
                numeric(char(index + 1)) &&
                count >= MIN_VARIANT
            ) {
                // variant(short):
                result.variants.push(
                    sensitive.slice(index + 1, offset)
                );

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
                offset = offset + 2;
                count = 2;
                groupCount++;

                while (alphanumeric(char(offset))) {
                    if (count > MAX_EXTENSION) {
                        return fail(offset, ERR_CODE_EXTENSION_TOO_LONG);
                    }

                    offset++;
                    count++;
                }
            }

            if (!groupCount) {
                return fail(offset, ERR_CODE_EMPTY_EXTENSION);
            }

            // extension():
            result.extensions.push({
                'singleton': sensitive.charAt(index + 1),
                'extensions': sensitive.slice(index + 3, offset).split(C_DASH)
            });

            index = offset;
        }
    }

    if (
        (index === 0 && x(char(0))) ||
        (index !== 1 && dash(char(index)) && x(char(index + 1)))
    ) {
        offset = index = index ? index + 2 : 1;

        while (
            dash(char(offset)) &&
            alphanumeric(char(offset + 1))
        ) {
            offset += 2;
            count = 1;

            while (alphanumeric(char(offset))) {
                if (count >= MAX_PRIVATE_USE) {
                    return fail(offset, ERR_CODE_PRIVATE_USE_TOO_LONG);
                }

                offset++;
                count++;
            }

            result.privateuse.push(sensitive.slice(index + 1, offset));
            index = offset;
        }
    }

    if (index !== tag.length) {
        return fail(index, ERR_CODE_EXTRA_CONTENT);
    }

    return result;
}

/**
 * Compile a language schema to a BCP 47 language tag.
 *
 * @param {Object} schema - Schema to compile.
 * @return {string} - BCP 47 language tag.
 */
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

/*
 * Expose.
 */

var bcp47 = {};

bcp47.parse = parse;
bcp47.stringify = stringify;

module.exports = bcp47;

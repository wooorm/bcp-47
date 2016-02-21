# bcp-47 [![Build Status][build-badge]][build-page] [![Coverage Status][coverage-badge]][coverage-page]

Parse and stringify [BCP 47][spec] language tags.

## Installation

[npm][]:

```bash
npm install bcp-47
```

**bcp-47** is also available as an AMD, CommonJS, and globals module,
[uncompressed and compressed][releases].

## Usage

Dependencies:

```javascript
var bcp47 = require('bcp-47');
```

Parsing:

```javascript
var schema = bcp47.parse('hy-Latn-IT-arevela');
```

Yields:

```json
{
  "language": "hy",
  "extendedLanguageSubtags": [],
  "script": "Latn",
  "region": "IT",
  "variants": [
    "arevela"
  ],
  "extensions": [],
  "privateuse": [],
  "irregular": null,
  "regular": null
}
```

Compiling:

```javascript
var tag = bcp47.stringify(schema);
```

Yields:

```txt
hy-Latn-IT-arevela
```

## API

### `bcp47.parse(tag[, options])`

Parse a BCP 47 tag into a language schema.
Note that the algorithm is case-insensitive.

**Options** (`Object?`):

*   `normalize` (`boolean`, default: `true`)
    — Whether to normalize legacy tags when possible.
    For example, `i-klingon` does not match the BCP 47 language
    algorithm but is valid nonetheless. It is suggested to use
    `tlh` instead (the ISO 639-3 code for Klingon).  When
    `normalize` is true, passing `i-klingon`, or other deprecated
    tags, is handled as if their suggested valid tag was given.

*   `forgiving` (`boolean`, default: `false`)
    — By default, when an error is encountered, an empty object
    is returned.  When in forgiving mode, all found values up to
    the point of the error are included.  So, for example,
    where by default `en-GB-abcdefghi` an empty object is returned
    (as the language variant is too long), in `forgiving` mode
    the `language` of `schema` is populated with `en` and the
    `region` is populated with `GB`.

*   `warning` ([`Function`][warning])
    — When given, `warning` is invoked when an error is encountered.

**Returns**: `Schema`.

**Throws**: When `tag` is either `null` or `undefined`.

### `schema`

A schema may have the following properties.  A schema is deemed empty
when it has neither `language`, `irregular`, `regular`, nor `privateuse`
(where an empty `privateuse` array is handled as no `privateuse`, too).

**Properties**:

*   `language` (`string`)
    — Two or three character [ISO 639][iso-639] language code,
    four character reserved language code, or 5 to 8 (inclusive)
    characters registered language subtag.  For example, `en` (English)
    or `cmn` (Mandarin Chinese).

*   `extendedLanguageSubtags` (`Array.<string>`)
    — Selected three-character [ISO 639][iso-639] codes, such as `yue`
    in `zh-yue-HK` (Chinese, Cantonese, as used in Hong Kong SAR).

*   `script` (`string`)
    — Four character [ISO 15924][iso-15924] script code, such as `Latn`
    in `hy-Latn-IT-arevela` (Eastern Armenian written in Latin script,
    as used in Italy).

*   `region` (`string`)
    — Two alphabetical character [ISO 3166-1][iso-3166-1] code, or three digit
    [UN M.49][un-m49] code.  For example, `CN` in `cmn-Hans-CN` (Mandarin
    Chinese, Simplified script, as used in China).

*   `variants` (`Array.<string>`)
    — 5 to 8 (inclusive) character language variants,
    such as both `rozaj` and `biske` in `sl-rozaj-biske` (San Giorgio
    dialect of Resian dialect of Slovenian).

*   `extensions` (`Array.<Object>`)
    — List of extensions, each an object containing a one character
    `singleton`, and a list of `extensions` (`string`).
    `singleton` cannot be `x` (case-insensitive), and `extensions`
    must be between two and eight (inclusive) characters.
    For example, an extension would be `u-co-phonebk` in
    `de-DE-u-co-phonebk` (German, as used in Germany, using German
    phonebook sort order), where `u` is the `singleton` and `co` and
    `phonebk` are its extensions.

*   `privateuse` (`Array.<string>`)
    — List of private-use subtags, where each subtag must be between
    one and eight (inclusive) characters.

*   `regular` (`string`)
    — One of the `regular` tags (tags which are seen as something
    different by the algorithm).

    Valid values are:

    *   `art-lojban`;
    *   `cel-gaulish`;
    *   `no-bok`;
    *   `no-nyn`;
    *   `zh-guoyu`;
    *   `zh-hakka`;
    *   `zh-min`;
    *   `zh-min-nan`;
    *   `zh-xiang`.

*   `irregular` (`string`)
    — One of the `irregular` tags (tags which are seen as invalid
    by the algorithm).

    Valid values are:

    *   `en-GB-oed`;
    *   `i-ami`;
    *   `i-bnn`;
    *   `i-default`;
    *   `i-enochian`;
    *   `i-hak`;
    *   `i-klingon`;
    *   `i-lux`;
    *   `i-mingo`;
    *   `i-navajo`;
    *   `i-pwn`;
    *   `i-tao`;
    *   `i-tay`;
    *   `i-tsu`;
    *   `sgn-BE-FR`;
    *   `sgn-BE-NL`;
    *   `sgn-CH-DE`.

### `function warning(reason, code, offset)`

Invoked when an error occurs.

**Parameters**:

*   `reason` (`string`) — English reason for failure;
*   `code` (`number`) — Code for failure;
*   `offset` (`number`) — Index-based position of error.

**Warnings**:

| code | reason                                                                 |
| ---- | ---------------------------------------------------------------------- |
| 1    | Too long variant, expected at most 8 characters                        |
| 2    | Too long extension, expected at most 8 characters                      |
| 3    | Too many extended language subtags, expected at most 3 subtags         |
| 4    | Empty extension, extensions must have at least 2 characters of content |
| 5    | Too long private-use area, expected at most 8 characters               |
| 6    | Found superfluous content after tag                                    |

### `bcp47.stringify(schema)`

Compile a schema into a BCP 47 language tag.

**Parameters**:

*   [`schema`][schema].

**Returns**: `tag` (`string`).

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definition -->

[build-badge]: https://img.shields.io/travis/wooorm/bcp-47.svg

[build-page]: https://travis-ci.org/wooorm/bcp-47

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/bcp-47.svg

[coverage-page]: https://codecov.io/github/wooorm/bcp-47?branch=master

[npm]: https://docs.npmjs.com/cli/install

[releases]: https://github.com/wooorm/bcp-47/releases

[license]: LICENSE

[author]: http://wooorm.com

[spec]: https://tools.ietf.org/html/bcp47

[warning]: #function-warningreason-code-offset

[schema]: #schema

[iso-639]: https://en.wikipedia.org/wiki/ISO_639

[iso-15924]: https://en.wikipedia.org/wiki/ISO_15924

[iso-3166-1]: https://en.wikipedia.org/wiki/ISO_3166-1

[un-m49]: https://en.wikipedia.org/wiki/UN_M.49

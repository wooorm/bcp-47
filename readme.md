# bcp-47

[![Build][badge-build-image]][badge-build-url]
[![Coverage][badge-coverage-image]][badge-coverage-url]
[![Downloads][badge-downloads-image]][badge-downloads-url]
[![Size][badge-size-image]][badge-size-url]

Parse and stringify [BCP 47][rfc-editor-bcp-47] language tags.

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`Extension`](#extension)
  * [`Options`](#options)
  * [`Schema`](#schema)
  * [`Warning`](#warning)
  * [`parse(tag[, options])`](#parsetag-options)
  * [`stringify(schema)`](#stringifyschema)
* [Compatibility](#compatibility)
* [Security](#security)
* [Related](#related)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This is a package that can parse BCP 47 language tags to objects
representing them,
and serialize those objects back into language tags.
It supports a forgiving mode to handle incorrect BCP 47 tags
and can emit warnings about problems in incorrect tags.

## When should I use this?

You can use this package if you need to access the data stored in BCP 47
language tags.
You can also use this package if you want to check (lint) or manipulate tags.

## Install

This package is [ESM only][github-gist-esm].
In Node.js (version 22+),
install with [npm][npmjs-install]:

```sh
npm install bcp-47
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {parse, stringify} from 'https://esm.sh/bcp-47@3?bundle'
</script>
```

## Use

```js
import {parse, stringify} from 'bcp-47'

const schema = parse('hy-Latn-IT-arevela')

console.log(schema)
console.log(stringify(schema))
```

Yields:

```js
{
  extendedLanguageSubtags: [],
  extensions: [],
  irregular: null,
  language: 'hy',
  privateuse: [],
  region: 'IT',
  regular: null,
  script: 'Latn',
  variants: [ 'arevela' ]
}
```

```text
hy-Latn-IT-arevela
```

## API

This package exports the identifiers
[`parse`][api-parse] and
[`stringify`][api-stringify].
There is no default export.
It exports the additional [TypeScript][] types
[`Extension`][api-extension],
[`Options`][api-options],
[`Schema`][api-schema], and
[`Warning`][api-warning].

### `Extension`

Extension subtag with its singleton (TypeScript type).

For example, `u-co-phonebk` in `de-DE-u-co-phonebk`.

###### Fields

* `extensions` (`Array<string>`)
  — subtags, such as `co` and `phonebk`
* `singleton` (`string`)
  — single character that is not `x`, such as `u`

### `Options`

Configuration for [`parse`][api-parse] (TypeScript type).

###### Fields

* `forgiving` (`boolean`, default: `false`)
  — keep what was found before an error,
  instead of returning an empty schema
* `normalize` (`boolean`, default: `true`)
  — replace deprecated tags with their preferred value,
  such as `i-klingon` with `tlh`
* `warning` ([`Warning`][api-warning], optional)
  — called when an error is found

### `Schema`

Parsed language tag (TypeScript type).

A schema is deemed empty when it has neither
`language`, `irregular`, `regular`, nor `privateuse`
(where an empty `privateuse` array is handled as no `privateuse` as well).

###### Fields

* `extendedLanguageSubtags` (`Array<string>`)
  — extended language subtags, such as `yue` in `zh-yue-HK`
* `extensions` ([`Array<Extension>`][api-extension])
  — extensions, such as `u-co-phonebk` in `de-DE-u-co-phonebk`
* `irregular` (`string`, optional)
  — irregular legacy tag, such as `i-default`
* `language` (`string`, optional)
  — [ISO 639][wikipedia-iso-639] language code or registered language subtag,
  such as `en` or `cmn`
* `privateuse` (`Array<string>`)
  — private-use subtags, such as `foo` in `en-x-foo`
* `region` (`string`, optional)
  — [ISO 3166-1][wikipedia-iso-3166-1] or [UN M49][wikipedia-un-m49] code,
  such as `CN` in `cmn-Hans-CN` or `419` in `es-419`
* `regular` (`string`, optional)
  — regular legacy tag, such as `zh-min`
* `script` (`string`, optional)
  — [ISO 15924][wikipedia-iso-15924] script code,
  such as `Latn` in `hy-Latn-IT-arevela`
* `variants` (`Array<string>`)
  — variant subtags, such as `rozaj` and `biske` in `sl-rozaj-biske`

### `Warning`

Called when an error occurs (TypeScript type).

###### Parameters

* `reason` (`string`)
  — reason for failure in English
* `code` (`number`)
  — code for failure
* `offset` (`number`)
  — index of place where the error occurred in the tag

###### Returns

Nothing (`undefined`).

###### Codes

| code | reason                                                                 |
| :--- | :--------------------------------------------------------------------- |
| 1    | Too long variant, expected at most 8 characters                        |
| 2    | Too long extension, expected at most 8 characters                      |
| 3    | Too many extended language subtags, expected at most 3 subtags         |
| 4    | Empty extension, extensions must have at least 2 characters of content |
| 5    | Too long private-use area, expected at most 8 characters               |
| 6    | Found superfluous content after tag                                    |
| 7    | Empty private-use area, expected at least 1 subtag                     |

### `parse(tag[, options])`

Parse a BCP 47 language tag.

> 👉 **Note**:
> the algorithm is case insensitive.

###### Parameters

* `tag` (`string`, required)
  — BCP 47 tag to parse
* `options` ([`Options`][api-options], optional)
  — configuration

###### Returns

Parsed BCP 47 language tag ([`Schema`][api-schema]).

###### Throws

When `tag` is `null` or `undefined`.

### `stringify(schema)`

Compile a language schema to a BCP 47 language tag.

###### Parameters

* `schema` ([`Partial<Schema>`][api-schema], optional)
  — parsed language tag

###### Returns

BCP 47 language tag (`string`).

## Compatibility

This package is compatible with maintained versions of Node.js.

When we cut a new major release,
we drop support for unmaintained versions of Node.
This means we try to keep the current release line,
`bcp-47@3`,
compatible with Node.js 22.

## Security

This package is safe.

## Related

* [`wooorm/bcp-47-match`][github-bcp-47-match]
  — match BCP 47 language tags with language ranges per RFC 4647
* [`wooorm/bcp-47-normalize`][github-bcp-47-normalize]
  — normalize, canonicalize, and format BCP 47 tags
* [`wooorm/iso-3166`][github-iso-3166]
  — ISO 3166 codes
* [`wooorm/iso-639-2`][github-iso-639-2]
  — ISO 639-2 codes
* [`wooorm/iso-639-3`][github-iso-639-3]
  — ISO 639-3 codes
* [`wooorm/iso-15924`][github-iso-15924]
  — ISO 15924 codes
* [`wooorm/un-m49`][github-un-m49]
  — UN M49 codes

## Contribute

Yes please!
See [How to Contribute to Open Source][opensource-guide-contribute].

## License

[MIT][file-license] © [Titus Wormer][wooorm]

<!-- Definitions -->

[api-extension]: #extension

[api-options]: #options

[api-parse]: #parsetag-options

[api-schema]: #schema

[api-stringify]: #stringifyschema

[api-warning]: #warning

[badge-build-image]: https://github.com/wooorm/bcp-47/workflows/main/badge.svg

[badge-build-url]: https://github.com/wooorm/bcp-47/actions

[badge-coverage-image]: https://img.shields.io/codecov/c/github/wooorm/bcp-47.svg

[badge-coverage-url]: https://codecov.io/github/wooorm/bcp-47

[badge-downloads-image]: https://img.shields.io/npm/dm/bcp-47.svg

[badge-downloads-url]: https://www.npmjs.com/package/bcp-47

[badge-size-image]: https://img.shields.io/bundlejs/size/bcp-47

[badge-size-url]: https://bundlejs.com/?q=bcp-47

[esmsh]: https://esm.sh

[file-license]: license

[github-bcp-47-match]: https://github.com/wooorm/bcp-47-match

[github-bcp-47-normalize]: https://github.com/wooorm/bcp-47-normalize

[github-gist-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[github-iso-15924]: https://github.com/wooorm/iso-15924

[github-iso-3166]: https://github.com/wooorm/iso-3166

[github-iso-639-2]: https://github.com/wooorm/iso-639-2

[github-iso-639-3]: https://github.com/wooorm/iso-639-3

[github-un-m49]: https://github.com/wooorm/un-m49

[npmjs-install]: https://docs.npmjs.com/cli/install

[opensource-guide-contribute]: https://opensource.guide/how-to-contribute/

[rfc-editor-bcp-47]: https://www.rfc-editor.org/info/bcp47/

[typescript]: https://www.typescriptlang.org

[wikipedia-iso-15924]: https://en.wikipedia.org/wiki/ISO_15924

[wikipedia-iso-3166-1]: https://en.wikipedia.org/wiki/ISO_3166-1

[wikipedia-iso-639]: https://en.wikipedia.org/wiki/ISO_639

[wikipedia-un-m49]: https://en.wikipedia.org/wiki/UN_M.49

[wooorm]: https://wooorm.com

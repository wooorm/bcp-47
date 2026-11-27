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
  * [`Irregular`](#irregular)
  * [`IrregularSchema`](#irregularschema)
  * [`LanguageSchema`](#languageschema)
  * [`LanguageSchemaInput`](#languageschemainput)
  * [`Message`](#message)
  * [`OnMessage`](#onmessage)
  * [`Options`](#options)
  * [`PrivateUseSchema`](#privateuseschema)
  * [`Regular`](#regular)
  * [`RegularSchema`](#regularschema)
  * [`RuleId`](#ruleid)
  * [`Schema`](#schema)
  * [`SchemaInput`](#schemainput)
  * [`Singleton`](#singleton)
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
It reports problems in tags as structured messages:
fatal ones when a tag does not match the BCP 47 grammar
(it is not *well-formed*),
and other ones when a tag matches the grammar but breaks other rules
(it is not *valid*),
such as a repeated singleton or variant.
It supports a forgiving mode to handle incorrect BCP 47 tags.

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
  language: 'hy',
  privateuse: [],
  region: 'IT',
  script: 'Latn',
  type: 'language',
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
[`Irregular`][api-irregular],
[`IrregularSchema`][api-irregular-schema],
[`LanguageSchema`][api-language-schema],
[`LanguageSchemaInput`][api-language-schema-input],
[`Message`][api-message],
[`OnMessage`][api-on-message],
[`Options`][api-options],
[`PrivateUseSchema`][api-private-use-schema],
[`Regular`][api-regular],
[`RegularSchema`][api-regular-schema],
[`RuleId`][api-rule-id],
[`Schema`][api-schema],
[`SchemaInput`][api-schema-input], and
[`Singleton`][api-singleton].

### `Extension`

Extension subtag with its singleton (TypeScript type).

For example, `u-co-phonebk` in `de-DE-u-co-phonebk`.

###### Fields

* `extensions` (`Array<string>`)
  — subtags, such as `co` and `phonebk`
* `singleton` ([`Singleton`][api-singleton])
  — singleton, such as `u`

### `Irregular`

Irregular legacy tag (TypeScript type).

These tags do not match the BCP 47 grammar.

###### Type

```ts
type Irregular =
  | 'en-GB-oed'
  | 'i-ami'
  | 'i-bnn'
  | 'i-default'
  | 'i-enochian'
  | 'i-hak'
  | 'i-klingon'
  | 'i-lux'
  | 'i-mingo'
  | 'i-navajo'
  | 'i-pwn'
  | 'i-tao'
  | 'i-tay'
  | 'i-tsu'
  | 'sgn-BE-FR'
  | 'sgn-BE-NL'
  | 'sgn-CH-DE'
```

### `IrregularSchema`

Parsed irregular legacy tag (TypeScript type).

###### Fields

* `type` (`'irregular'`)
  — kind of tag
* `value` ([`Irregular`][api-irregular])
  — irregular legacy tag, such as `i-default`

### `LanguageSchema`

Parsed language tag (TypeScript type).

###### Fields

* `extendedLanguageSubtags` (`Array<string>`)
  — extended language subtags, such as `yue` in `zh-yue-HK`
* `extensions` ([`Array<Extension>`][api-extension])
  — extensions, such as `u-co-phonebk` in `de-DE-u-co-phonebk`
* `language` (`string`)
  — [ISO 639][wikipedia-iso-639] language code or registered language subtag,
  such as `en` or `cmn`
* `privateuse` (`Array<string>`)
  — private-use subtags, such as `foo` in `en-x-foo`
* `region` (`string` or `undefined`)
  — [ISO 3166-1][wikipedia-iso-3166-1] or [UN M49][wikipedia-un-m49] code,
  such as `CN` in `cmn-Hans-CN` or `419` in `es-419`
* `script` (`string` or `undefined`)
  — [ISO 15924][wikipedia-iso-15924] script code,
  such as `Latn` in `hy-Latn-IT-arevela`
* `type` (`'language'`)
  — kind of tag
* `variants` (`Array<string>`)
  — variant subtags, such as `rozaj` and `biske` in `sl-rozaj-biske`

### `LanguageSchemaInput`

Language tag to serialize (TypeScript type).

Like [`LanguageSchema`][api-language-schema],
[`LanguageSchemaInput`][api-language-schema-input],
but fields without a value can be omitted.

###### Fields

* `extendedLanguageSubtags` (`Array<string>`, optional)
  — extended language subtags
* `extensions` ([`Array<Extension>`][api-extension], optional)
  — extensions
* `language` (`string`)
  — language
* `privateuse` (`Array<string>`, optional)
  — private-use subtags
* `region` (`string`, optional)
  — region
* `script` (`string`, optional)
  — script
* `type` (`'language'`)
  — kind of tag
* `variants` (`Array<string>`, optional)
  — variant subtags

### `Message`

Message about a problem in a tag (TypeScript type).

###### Fields

* `actual` (`string`)
  — part of the tag that is reported, such as `abcdefghi`
* `expected` (`Array<string>`, optional)
  — suggested values to use instead of `actual`
* `fatal` (`boolean`)
  — whether the tag could not be parsed;
  `true` when it does not match the BCP 47 grammar
  (it is not well-formed),
  `false` when it matches the grammar but breaks another rule
  (it is not valid)
* `range` (`[start: number, end: number]`)
  — offsets of the reported part in the tag
  (0-indexed start, and the index after the end)
* `reason` (`string`)
  — reason for the message, in English (uses markdown)
* `ruleId` ([`RuleId`][api-rule-id])
  — category of the message, such as `'variant-too-long'`
* `source` (`'bcp-47'`)
  — namespace of the message

### `OnMessage`

Called when a problem is found (TypeScript type).

###### Parameters

* `message` ([`Message`][api-message])
  — message about a problem in a tag

###### Returns

Nothing (`undefined`).

### `Options`

Configuration for [`parse`][api-parse] (TypeScript type).

###### Fields

* `forgiving` (`boolean`, default: `false`)
  — keep what was found before a fatal error,
  instead of returning `undefined`
* `normalize` (`boolean`, default: `true`)
  — replace deprecated tags with their preferred value,
  such as `i-klingon` with `tlh`
* `onmessage` ([`OnMessage`][api-on-message], optional)
  — called when a problem is found

### `PrivateUseSchema`

Parsed private-use tag (TypeScript type).

###### Fields

* `privateuse` (`[first: string, ...rest: Array<string>]`)
  — private-use subtags, such as `foo` in `x-foo`
* `type` (`'privateuse'`)
  — kind of tag

### `Regular`

Regular legacy tag (TypeScript type).

These tags match the BCP 47 grammar but mean something different.

###### Type

```ts
type Regular =
  | 'art-lojban'
  | 'cel-gaulish'
  | 'no-bok'
  | 'no-nyn'
  | 'zh-guoyu'
  | 'zh-hakka'
  | 'zh-min'
  | 'zh-min-nan'
  | 'zh-xiang'
```

### `RegularSchema`

Parsed regular legacy tag (TypeScript type).

###### Fields

* `type` (`'regular'`)
  — kind of tag
* `value` ([`Regular`][api-regular])
  — regular legacy tag, such as `zh-min`

### `RuleId`

Category of a message (TypeScript type).

###### Type

```ts
type RuleId =
  // Example: `aa-bbb-ccc-ddd-eee`.
  | 'extended-language-subtags-too-many'
  // Example: `en-i-a`.
  | 'extension-empty'
  // Example: `en-i-abcdefghi`.
  | 'extension-too-long'
  // Example: `en-x`.
  | 'private-use-empty'
  // Example: `en-x-abcdefghi`.
  | 'private-use-too-long'
  // Example: `en-a-bbb-a-ccc` (not fatal).
  | 'singleton-duplicate'
  // Example: `en-i`.
  | 'tag-unexpected-content'
  // Example: `de-DE-1901-1901` (not fatal).
  | 'variant-duplicate'
  // Example: `en-GB-abcdefghi`.
  | 'variant-too-long'
```

### `Schema`

Parsed tag (TypeScript type).

Check `type` to find out which kind of tag it is.

###### Type

```ts
type Schema =
  | IrregularSchema
  | LanguageSchema
  | PrivateUseSchema
  | RegularSchema
```

### `SchemaInput`

Tag to serialize (TypeScript type).

Like [`Schema`][api-schema],
but with [`LanguageSchemaInput`][api-language-schema-input]
instead of `LanguageSchema`.

###### Type

```ts
type SchemaInput =
  | IrregularSchema
  | LanguageSchemaInput
  | PrivateUseSchema
  | RegularSchema
```

### `Singleton`

Extension singleton (TypeScript type).

Any lowercase ASCII letter or digit except `x`.

###### Type

```ts
type Singleton =
  | '0'
  // …
  | '9'
  | 'a'
  // …
  | 'w'
  | 'y'
  | 'z'
```

### `parse(tag[, options])`

Parse a BCP 47 language tag.

> 👉 **Note**:
> the algorithm is case insensitive.
> Subtags are returned in their canonical casing
> ([RFC 5646 § 2.1.1][rfc-editor-rfc-5646-casing]).

When a tag does not match the BCP 47 grammar,
parsing stops with a fatal message,
and `undefined` is returned
(or what was found before the problem, in `forgiving` mode).
When a tag matches the grammar but breaks another rule,
such as a repeated singleton,
a non-fatal message is emitted and parsing continues.

###### Parameters

* `tag` (`string`)
  — BCP 47 tag to parse
* `options` ([`Options`][api-options], optional)
  — configuration

###### Returns

Parsed BCP 47 language tag ([`Schema`][api-schema]),
or `undefined` when nothing was parsed.

### `stringify(schema)`

Compile a language schema to a BCP 47 language tag.

###### Parameters

* `schema` ([`SchemaInput`][api-schema-input], optional)
  — tag to serialize

###### Returns

BCP 47 language tag (`string`).

###### Throws

When `schema` would not make a well-formed tag,
such as an unknown legacy tag,
a `region` of 3 letters,
or a `singleton` of `x`.

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

[api-irregular]: #irregular

[api-irregular-schema]: #irregularschema

[api-language-schema]: #languageschema

[api-language-schema-input]: #languageschemainput

[api-message]: #message

[api-on-message]: #onmessage

[api-options]: #options

[api-parse]: #parsetag-options

[api-private-use-schema]: #privateuseschema

[api-regular]: #regular

[api-regular-schema]: #regularschema

[api-rule-id]: #ruleid

[api-schema]: #schema

[api-schema-input]: #schemainput

[api-singleton]: #singleton

[api-stringify]: #stringifyschema

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

[rfc-editor-rfc-5646-casing]: https://www.rfc-editor.org/rfc/rfc5646#section-2.1.1

[typescript]: https://www.typescriptlang.org

[wikipedia-iso-15924]: https://en.wikipedia.org/wiki/ISO_15924

[wikipedia-iso-3166-1]: https://en.wikipedia.org/wiki/ISO_3166-1

[wikipedia-iso-639]: https://en.wikipedia.org/wiki/ISO_639

[wikipedia-un-m49]: https://en.wikipedia.org/wiki/UN_M.49

[wooorm]: https://wooorm.com

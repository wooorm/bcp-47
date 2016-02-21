/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module bcp-47
 * @fileoverview Test suite for `bcp-47`.
 */

'use strict';

/* eslint-env node */

/*
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var test = require('tape');
var bcp47 = require('..');

/*
 * Methods.
 */

var join = path.join;
var read = fs.readFileSync;
var dir = fs.readdirSync;

/*
 * Tests.
 */

test('bcp47', function (t) {
    t.equal(
        typeof bcp47,
        'object',
        'should be an `object`'
    );

    t.test('.parse()', function (st) {
        st.equal(typeof bcp47.parse, 'function', 'should be a method');

        st.throws(function () {
            bcp47.parse();
        }, 'should throw when given `undefined`');

        st.throws(function () {
            bcp47.parse(null);
        }, 'should throw when given `null`');

        st.doesNotThrow(function () {
            bcp47.parse({
                /** Stringify. */
                'toString': function () {
                    return 'en';
                }
            });
        }, 'should coerce to a string');

        st.deepEqual(
            bcp47.parse('i-klingon'),
            {
                'language': 'tlh',
                'extendedLanguageSubtags': [],
                'script': null,
                'region': null,
                'variants': [],
                'extensions': [],
                'privateuse': [],
                'irregular': null,
                'regular': null
            },
            'should normalize when possible'
        );

        st.deepEqual(
            bcp47.parse('i-klingon', {
                'normalize': false
            }),
            {
                'language': null,
                'extendedLanguageSubtags': [],
                'script': null,
                'region': null,
                'variants': [],
                'extensions': [],
                'privateuse': [],
                'irregular': 'i-klingon',
                'regular': null
            },
            'should not normalize when `normalize: false`'
        );

        st.deepEqual(
            bcp47.parse('i-default'),
            {
                'language': null,
                'extendedLanguageSubtags': [],
                'script': null,
                'region': null,
                'variants': [],
                'extensions': [],
                'privateuse': [],
                'irregular': 'i-default',
                'regular': null
            },
            'should return an irregular when not normalizable'
        );

        st.deepEqual(
            bcp47.parse('zh-min'),
            {
                'language': null,
                'extendedLanguageSubtags': [],
                'script': null,
                'region': null,
                'variants': [],
                'extensions': [],
                'privateuse': [],
                'irregular': null,
                'regular': 'zh-min'
            },
            'should return a regular when not normalizable'
        );

        st.test('Too long variant', function (sst) {
            var fixture = 'en-GB-abcdefghi';

            sst.plan(6);

            /**
             * Handle the warnings.
             */
            function warning() {
                sst.equal(
                    arguments[0],
                    'Too long variant, expected at most 8 characters'
                );

                sst.equal(arguments[1], 1);

                sst.equal(arguments[2], 15);

                sst.equal(arguments.length, 3);
            }

            sst.deepEqual(
                bcp47.parse(fixture, {
                    'warning': warning
                }),
                {
                    'language': null,
                    'extendedLanguageSubtags': [],
                    'script': null,
                    'region': null,
                    'variants': [],
                    'extensions': [],
                    'privateuse': [],
                    'irregular': null,
                    'regular': null
                },
                'should return `null`'
            );

            sst.deepEqual(
                bcp47.parse(fixture, {
                    'forgiving': true
                }),
                {
                    'language': 'en',
                    'extendedLanguageSubtags': [],
                    'script': null,
                    'region': 'GB',
                    'variants': [],
                    'extensions': [],
                    'privateuse': [],
                    'irregular': null,
                    'regular': null
                },
                'should return untill the error when `forgiving: true`'
            );

            sst.end();
        });

        st.test('Too many subtags', function (sst) {
            var fixture = 'aa-bbb-ccc-ddd-eee';

            sst.plan(6);

            /**
             * Handle the warnings.
             */
            function warning() {
                sst.equal(
                    arguments[0],
                    'Too many extended language subtags, ' +
                    'expected at most 3 subtags'
                );

                sst.equal(arguments[1], 3);

                sst.equal(arguments[2], 14);

                sst.equal(arguments.length, 3);
            }

            sst.deepEqual(
                bcp47.parse(fixture, {
                    'warning': warning
                }),
                {
                    'language': null,
                    'extendedLanguageSubtags': [],
                    'script': null,
                    'region': null,
                    'variants': [],
                    'extensions': [],
                    'privateuse': [],
                    'irregular': null,
                    'regular': null
                },
                'should return `null`'
            );

            sst.deepEqual(
                bcp47.parse('aa-bbb-ccc-ddd-eee', {
                    'forgiving': true
                }),
                {
                    'language': 'aa',
                    'extendedLanguageSubtags': [
                        'bbb',
                        'ccc',
                        'ddd'
                    ],
                    'script': null,
                    'region': null,
                    'variants': [],
                    'extensions': [],
                    'privateuse': [],
                    'irregular': null,
                    'regular': null
                },
                'should return untill the error when `forgiving: true`'
            );
        });

        st.test('Too long extension', function (sst) {
            var fixture = 'en-i-abcdefghi';

            sst.plan(6);

            /**
             * Handle the warnings.
             */
            function warning() {
                sst.equal(
                    arguments[0],
                    'Too long extension, expected at most 8 characters'
                );

                sst.equal(arguments[1], 2);

                sst.equal(arguments[2], 13);

                sst.equal(arguments.length, 3);
            }

            sst.deepEqual(
                bcp47.parse(fixture, {
                    'warning': warning
                }),
                {
                    'language': null,
                    'extendedLanguageSubtags': [],
                    'script': null,
                    'region': null,
                    'variants': [],
                    'extensions': [],
                    'privateuse': [],
                    'irregular': null,
                    'regular': null
                },
                'should return `null`'
            );

            sst.deepEqual(
                bcp47.parse(fixture, {
                    'forgiving': true
                }),
                {
                    'language': 'en',
                    'extendedLanguageSubtags': [],
                    'script': null,
                    'region': null,
                    'variants': [],
                    'extensions': [],
                    'privateuse': [],
                    'irregular': null,
                    'regular': null
                },
                'should return untill the error when `forgiving: true`'
            );

            sst.end();
        });

        st.test('Empty extension', function (sst) {
            var fixture = 'en-i-a';

            sst.plan(6);

            /**
             * Handle the warnings.
             */
            function warning() {
                sst.equal(
                    arguments[0],
                    'Empty extension, extensions must have ' +
                    'at least 2 characters of content'
                );

                sst.equal(arguments[1], 4);

                sst.equal(arguments[2], 4);

                sst.equal(arguments.length, 3);
            }

            sst.deepEqual(
                bcp47.parse(fixture, {
                    'warning': warning
                }),
                {
                    'language': null,
                    'extendedLanguageSubtags': [],
                    'script': null,
                    'region': null,
                    'variants': [],
                    'extensions': [],
                    'privateuse': [],
                    'irregular': null,
                    'regular': null
                },
                'should return `null`'
            );

            sst.deepEqual(
                bcp47.parse(fixture, {
                    'forgiving': true
                }),
                {
                    'language': 'en',
                    'extendedLanguageSubtags': [],
                    'script': null,
                    'region': null,
                    'variants': [],
                    'extensions': [],
                    'privateuse': [],
                    'irregular': null,
                    'regular': null
                },
                'should return untill the error when `forgiving: true`'
            );

            sst.end();
        });

        st.test('Too long private-use', function (sst) {
            var fixture = 'en-x-abcdefghi';

            sst.plan(6);

            /**
             * Handle the warnings.
             */
            function warning() {
                sst.equal(
                    arguments[0],
                    'Too long private-use area, expected at most ' +
                    '8 characters'
                );

                sst.equal(arguments[1], 5);

                sst.equal(arguments[2], 13);

                sst.equal(arguments.length, 3);
            }

            sst.deepEqual(
                bcp47.parse(fixture, {
                    'warning': warning
                }),
                {
                    'language': null,
                    'extendedLanguageSubtags': [],
                    'script': null,
                    'region': null,
                    'variants': [],
                    'extensions': [],
                    'privateuse': [],
                    'irregular': null,
                    'regular': null
                },
                'should return `null`'
            );

            sst.deepEqual(
                bcp47.parse(fixture, {
                    'forgiving': true
                }),
                {
                    'language': 'en',
                    'extendedLanguageSubtags': [],
                    'script': null,
                    'region': null,
                    'variants': [],
                    'extensions': [],
                    'privateuse': [],
                    'irregular': null,
                    'regular': null
                },
                'should return untill the error when `forgiving: true`'
            );

            sst.end();
        });

        st.test('Extra content', function (sst) {
            var fixture = 'abcdefghijklmnopqrstuvwxyz';

            sst.plan(6);

            /**
             * Handle the warnings.
             */
            function warning() {
                sst.equal(
                    arguments[0],
                    'Found superfluous content after tag'
                );

                sst.equal(arguments[1], 6);

                sst.equal(arguments[2], 0);

                sst.equal(arguments.length, 3);
            }

            sst.deepEqual(
                bcp47.parse(fixture, {
                    'warning': warning
                }),
                {
                    'language': null,
                    'extendedLanguageSubtags': [],
                    'script': null,
                    'region': null,
                    'variants': [],
                    'extensions': [],
                    'privateuse': [],
                    'irregular': null,
                    'regular': null
                },
                'should return `null`'
            );

            sst.deepEqual(
                bcp47.parse(fixture, {
                    'forgiving': true
                }),
                {
                    'language': null,
                    'extendedLanguageSubtags': [],
                    'script': null,
                    'region': null,
                    'variants': [],
                    'extensions': [],
                    'privateuse': [],
                    'irregular': null,
                    'regular': null
                },
                'should return untill the error when `forgiving: true`'
            );

            sst.end();
        });

        st.end();
    });

    t.test('.stringify()', function (st) {
        st.equal(typeof bcp47.stringify, 'function', 'should be a method');

        st.equal(
            bcp47.stringify(),
            '',
            'should compile to an empty string when without `schema`'
        );

        st.equal(
            bcp47.stringify({
                'language': 'tlh'
            }),
            'tlh',
            'should compile a language'
        );

        st.equal(
            bcp47.stringify({
                'privateuse': ['111', 'aaaaa', 'BBB']
            }),
            'x-111-aaaaa-BBB',
            'should compile a private-use area'
        );

        st.equal(
            bcp47.stringify({
                'irregular': 'i-ami'
            }),
            'i-ami',
            'should compile an irregular'
        );

        st.equal(
            bcp47.stringify({
                'regular': 'no-bok'
            }),
            'no-bok',
            'should compile an irregular'
        );

        st.equal(
            bcp47.stringify({
                'script': 'Latn'
            }),
            '',
            'should not compile a script without language'
        );

        st.equal(
            bcp47.stringify({
                'language': 'en',
                'region': 'GB',
                'extensions': [{}]
            }),
            'en-GB',
            'should not compile empty extensions'
        );

        st.end();
    });

    t.end();
});

/*
 * Fixtures.
 */

test('fixtures', function (t) {
    var base = join(__dirname, 'fixtures');

    dir(base)
        .filter(function (fileName) {
            return fileName.charAt(0) !== '.';
        })
        .forEach(function (fileName) {
            var filePath = join(base, fileName);
            var name = fileName.slice(0, fileName.indexOf('.'));
            var fixture = JSON.parse(read(filePath, 'utf8'));
            var schema = bcp47.parse(name, {
                'normalize': false
            });
            var tag = bcp47.stringify(schema);

            t.test(name, function (st) {
                st.deepEqual(schema, fixture, 'should parse');
                st.deepEqual(tag, name, 'should stringify');

                st.end();
            });
        });

    t.end();
});

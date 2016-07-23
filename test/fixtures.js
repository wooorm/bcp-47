/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module bcp-47
 * @fileoverview Test suite for `bcp-47`.
 */

'use strict';

/* Dependencies. */
var fs = require('fs');
var path = require('path');
var test = require('tape');
var bcp47 = require('..');

/* Methods. */
var join = path.join;
var read = fs.readFileSync;
var dir = fs.readdirSync;

/* Fixtures. */
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
      var schema = bcp47.parse(name, {normalize: false});
      var tag = bcp47.stringify(schema);

      t.test(name, function (st) {
        st.deepEqual(schema, fixture, 'should parse');
        st.deepEqual(tag, name, 'should stringify');
        st.end();
      });
    });

  t.end();
});

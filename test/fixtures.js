'use strict';

var fs = require('fs');
var path = require('path');
var test = require('tape');
var bcp47 = require('..');

var join = path.join;
var read = fs.readFileSync;
var dir = fs.readdirSync;

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

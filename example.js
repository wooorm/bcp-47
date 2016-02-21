// Dependencies:
var bcp47 = require('./index.js');

// Parsing:
var schema = bcp47.parse('hy-Latn-IT-arevela');

// Yields:
console.log('json', JSON.stringify(schema, 0, 2));

// Compiling:
var tag = bcp47.stringify(schema);

// Yields:
console.log('txt', tag);

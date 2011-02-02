(function(assert) {

var validator = json; // XXX
    keys = Object.keys || (function () {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !{toString:null}.propertyIsEnumerable("toString"),
            DontEnums = [
                'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty',
                'isPrototypeOf', 'propertyIsEnumerable', 'constructor'
            ],
            DontEnumsLength = DontEnums.length;

        return function (o) {
            if (typeof o != "object" && typeof o != "function" || o === null)
                throw new TypeError("Object.keys called on a non-object");

            var result = [];
            for (var name in o) {
                if (hasOwnProperty.call(o, name))
                    result.push(name);
            }

            if (hasDontEnumBug) {
                for (var i = 0; i < DontEnumsLength; i++) {
                    if (hasOwnProperty.call(o, DontEnums[i]))
                        result.push(DontEnums[i]);
                }
            }

            return result;
        };
    })();
    function mixin(obj) {
        var sources = Array.prototype.slice.call(arguments, 1);
        while (sources.length) {
            var source = sources.shift();
            if (! source) continue; // skip
            if (typeof(source) !== 'object') {
                throw new TypeError('mixin non-object');
            }
            for (var p in source) {
                if (source.hasOwnProperty(p)) {
                    obj[p] = source[p];
                }
            }
        }
        return obj;
    };

// base tests
(function() {
    module('Validator: Baseline');

    function assertValidates(passingValue, failingValue, attributes) {
        var schema = {
            name: 'Resource',
            properties: { field: {} }
        };
        var attr = keys(attributes)[0];
        mixin(schema.properties.field, attributes);
        var result;

        return function() {
            result = json.validate({ field: passingValue }, schema);
            assert.strictEqual(result.valid, true, 'conforming object, result.valid === true');
            assert.deepEqual(result.errors, [], 'conforming object, result.errors == []');

            result = json.validate({ field: failingValue }, schema);
            assert.strictEqual(result.valid, false, 'non-conforming object, result.valid === false');
            assert.notEqual(result.errors.length, 0, 'non-conforming object, has errors');
            assert.equal(result.errors[0].attribute, attr, 'non-conforming object, error attribute');
            assert.equal(result.errors[0].property, 'field', 'non-conforming object, error property');
        };
    }

    test("with <type>:'string'",    assertValidates ('hello',   42,        { type: "string" }));
    test("with <type>:'number'",    assertValidates (42,       'hello',    { type: "number" }));
    test("with <type>:'integer'",   assertValidates (42,        42.5,      { type: "integer" }));
    test("with <type>:'array'",     assertValidates ([4, 2],   'hi',       { type: "array" }));
    test("with <type>:'object'",    assertValidates ({},        [],        { type: "object" }));
    test("with <type>:'boolean'",   assertValidates (false,     42,        { type: "boolean" }));
    test("with <type>:'null'",      assertValidates (null,      false,     { type: "null" }));
    test("with <type>:'any'",       assertValidates (9,         undefined, { type: "any" }));
    test("with <pattern>",          assertValidates ("kaboom", "42",       { pattern: /^[a-z]+$/ }));
    test("with <maxLength>",        assertValidates ("boom",   "kaboom",   { maxLength: 4 }));
    test("with <minLength>",        assertValidates ("kaboom", "boom",     { minLength: 6 }));
    test("with <minimum>",          assertValidates ( 512,      43,        { minimum:   473 }));
    test("with <maximum>",          assertValidates ( 512,      1949,      { maximum:   678 }));
    test("with <maximum>",          assertValidates ( 512,      1949,      { maximum:   678 }));
    test("with <divisibleBy>",      assertValidates ( 10,       9,         { divisibleBy: 5 }));
    test("with <enum>",             assertValidates ("orange",  "cigar",   { enum:      ["orange", "apple", "pear"] }));
    test("with <requires>", function() {
            var schema = {
                properties: { town:    { optional: true, requires: "country" },
                              country: { optional: true }
                }
            };
            var result;

            result = json.validate({ town: "luna", country: "moon" }, schema);
            assert.strictEqual(result.valid, true, 'conforming object, result.valid === true');

            result = json.validate({ town: "luna" }, schema);
            assert.strictEqual(result.valid, false, 'non-conforming object, result.valid === false');
            assert.equal(result.errors.length, 1, 'non-conforming object, has errors');
            assert.equal(result.errors[0].attribute, 'requires', 'non-conforming object, error attribute');
            assert.equal(result.errors[0].property, 'town', 'non-conforming object, error property');
    });
})();


(function() {
    module('Validator: Full Schema');

    // "A schema":
    var schema = {
        name: 'Article',
        properties: {
            title: {
                type: 'string',
                maxLength: 140,
                optional: true,
                conditions: {
                    optional: function () {
                        return !this.published;
                    }
                }
            },
            date: { type: 'string', format: 'date' },
            body: { type: 'string' },
            tags: {
                type: 'array',
                items: {
                    type: 'string',
                    pattern: /[a-z ]+/
                }
            },
            author:    { type: 'string', pattern: /^[\w ]+$/i, optional: false },
            published: { type: 'boolean', 'default': false },
            category:  { type: 'string', required: true }
        }
    };
    // "and an object":
    var document = {
        title: 'Gimme some Gurus',
        date: '2011-02-01',
        body: "And I will pwn your codex.",
        tags: ['energy drinks', 'code'],
        author: 'cloudhead',
        published: true,
        category: 'misc'
    };
    // "can be validated with `validator.validate`":
    var result;
    var object;

    test("if it conforms", function() {
        result = validator.validate(document, schema);
        assert.strictEqual(result.valid, true, 'conforming object, result.valid === true');
        assert.deepEqual(result.errors, [], 'conforming object, result.errors == []');
    });

    test("if it has a missing non-optional property", function() {
        object = mixin({}, document);
        delete object.author;
        result = validator.validate(object, schema);
        assert.strictEqual(result.valid, false, 'non-conforming object, result.valid === false');
        assert.equal(result.errors[0].attribute, 'optional', 'non-conforming object, error attribute');
        assert.equal(result.errors[0].property, 'author', 'non-conforming object, error property');
    });

    test("if it has a missing required property", function() {
        object = mixin({}, document);
        delete object.category;
        result = validator.validate(object, schema);
        assert.strictEqual(result.valid, false, 'non-conforming object, result.valid === false');
        assert.equal(result.errors[0].attribute, 'required', 'non-conforming object, error attribute');
        assert.equal(result.errors[0].property, 'category', 'non-conforming object, error property');
    });

    test("if it didn't validate a pattern", function() {
        object = mixin({}, document);
        object.author = 'email@address.com';
        result = validator.validate(object, schema);
        assert.strictEqual(result.valid, false, 'non-conforming object, result.valid === false');
        assert.equal(result.errors[0].attribute, 'pattern', 'non-conforming object, error attribute');
        assert.equal(result.errors[0].property, 'author', 'non-conforming object, error property');
    });
})();


})(QUnit);

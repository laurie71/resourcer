
var errors;

this.defaultMessages = {
    optional:  "",
    pattern:   "",
    maximum:   "",
    minimum:   "",
    maxLength: "",
    minLength: "",
    requires:  "",
    unique:    ""
};
this.defaultSchema = {


};

var formats = {
    'email':          /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
    'ip-address':     /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i,
    'ipv6':           /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/,
    'date-time':      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
    'date':           /^\d{4}-\d{2}-\d{2}$/,
    'time':           /^\d{2}:\d{2}:\d{2}$/,

    'utc-millisec':   { test: function(value) { return typeof(value) === 'number' && value >= 0; }},
    'regex':          { test: function(value) { try { new RegExp(value); } catch(e) { return false; } return true; }},


    // should test those regex's carefully:
    'color':          /^#[a-z0-9]{6}|#[a-z0-9]{3}|(?:rgb\(\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*\))aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|and yellow$/i,

    //'style':        (not supported)
    //'phone':        (not supported)
    //'uri':          (not supported)
    //'host-name':    (not supported)
};

this.formatsExtended = {
    'url': /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
};

this.validate = function (object, schema) {
    errors = [];

    if (typeof(object) !== 'object' || typeof(schema) !== 'object') {
        throw new(TypeError)("`validate` takes two objects as arguments");
    }

    this.validateObject(object, schema);
    return { valid: !Boolean(errors.length), errors: errors };
};

this.validateObject = function (object, schema) {
    var that = this;
    Object.keys(schema.properties).forEach(function (k) {
        that.validateProperty(object, k, schema.properties[k])
    });
};

this.checkType = function (val, type) {
    switch (type) {
        case 'string':
            return typeof(val) === 'string';
        case 'array':
            return Array.isArray(val);
        case 'object':
            return val && (typeof(val) === 'object') && !Array.isArray(val);
        case 'number':
            return typeof(val) === 'number';
        case 'integer':
            return typeof(val) === 'number' && (val % 1 === 0);
        case 'null':
            return val === null;
        case 'boolean':
            return typeof(val) === 'boolean';
        case 'any':
            return typeof(val) !== 'undefined';
        default:
            return true;
    }
};

this.validateProperty = function (object, property, schema) {
    var type, value = object[property], valid;

    if (value === undefined) {
        // support 'optional' for schemas written against pre-03 drafts
        if (schema.optional) return;
        if (schema.default != undefined) return;
        if (schema.optional === false && schema.type !== 'any') {
            return error('optional', property, undefined, schema, errors);
        }

        if (schema.required && !schema.optional) {
            error('required', property, null, schema, errors);
            return;
        }
    }

    if (schema.format) {
        var formatName = schema.format;
        var formatTest = this.formatsExtended[formatName] || formats[formatName];

        if (!formatTest) {
            return error('format', property, value, schema);
1        }

        valid = formatTest.test(value);
        if (!valid) {
            return error('format', property, value, schema);
        }
    }

    if (schema.enum && schema.enum.indexOf(value) === -1) {
        error('enum', property, value, schema);
    }
    if (schema.requires && object[schema.requires] === undefined) {
        error('requires', property, null, schema);
    }
    if (this.checkType(value, schema.type)) {
        switch (schema.type || typeof(value)) {
            case 'string':
                constrain('minLength', value.length, function (a, e) { return a >= e });
                constrain('maxLength', value.length, function (a, e) { return a <= e });
                constrain('pattern',   value,        function (a, e) { return e.test(a) });
                break;
            case 'number':
                constrain('minimum',     value, function (a, e) { return a >= e });
                constrain('maximum',     value, function (a, e) { return a <= e });
                constrain('divisibleBy', value, function (a, e) { return a % e === 0 });
        }
    } else {
        error('type', property, typeof(value), schema);
    }

    function constrain(name, value, assert) {
        if ((name in schema) && !assert(value, schema[name])) {
            error(name, property, value, schema);
        }
    }
};

function error(attribute, property, actual, schema) {
    var message = this.defaultMessages && this.defaultMessages[property] || "no default message";
    errors.push({
        attribute: attribute,
        property: property,
        expected: schema[attribute] || exports.defaultSchema[attribute],
        actual: actual,
        message: message
    });
}


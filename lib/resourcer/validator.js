(function(exports) {
    exports.validate = validate;

    /**
     * Validate <code>object</code> against a JSON Schema.
     * If <code>object</code> is self-describing (i.e. has a
     * <code>$schema</code> property), it will also be validated
     * against the referenced schema. This behaviour bay be
     * suppressed by setting the
{@link #validate.options.???}
     * option to
<code></code>.
     *
     * If <code>schema</code> is not specified, and <code>object</code>
     * is <strong>not</strong> self-describing, validation always passed.
     *
     * <strong>Note:</strong> in order to pass options but no schema,
     * <code>schema</code> <em>must</em> be specified in the call to
     * <code>validate()</code>; otherwise, <code>options</code> will
     * be interpreted as the schema. <code>schema</code> may be passed
     * as <code>null</code>, <code>undefinded</code>, or the empty object
     * (<code>{}</code>) in this case.
     *
     * @param {Object} object the object to validate.
     * @param {Object} schema (optional) the JSON Schema to validate against.
     * @param {Object} options (optional) options controlling the validation
     *      process. See {@link #validate.defaults) for details.
     */
    function validate(object, schema, options) {
        options = mixin({}, options, validate.defaults);
        var errors = [];

        validateObject(object, schema, options, errors);
        // todo: self-described validation
        // if (! options.selfDescribing) { ... }

        return {
            valid: !(errors.length),
            errors: errors
        };
    };

    /**
     * Default validation options. Defaults can be overridden by
     * passing an 'options' hash to {@link #validate}. They can
     * also be set globally be changing the values in
     * <code>validate.defaults</code> directly.
     */
    validate.defaults = {
        /**
         * <p>
         * Enforce 'format' constraints.
         * </p><p>
         * <em>Default: <code>true</code></em>
         * </p>
         */
        validateFormats: true,
        /**
         * <p>
         * When {@link #validateFormats} is <code>true</code>,
         * treat unrecognized formats as validation errors.
         * </p><p>
         * <em>Default: <code>false</code></em>
         * </p>
         *
         * @see validation.formats for default supported formats.
         */
        validateFormatsStrict: false
    };

    /**
     * Default messages to include with validation errors.
     */
    validate.messages = {
        optional:  "",
        pattern:   "",
        maximum:   "",
        minimum:   "",
        maxLength: "",
        minLength: "",
        requires:  "",
        unique:    ""
    };


    /**
     *
     */
    validate.formats =
        { email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i
        , date: { test: function (val) { return new Date(val).toString() !== 'Invalid Date'; }}
        // TODO: remaining formats from spec
        };


    // --------------------
    // END PUBLIC API
    // --------------------


    function validateObject(object, schema, options, errors) {
        var properties = schema.properties;
        for (var p in properties) {
            if (properties.hasOwnProperty(p)) {
                validateProperty(object, p, properties[p], options, errors);
            }
        }
    };

    function validateProperty(object, property, schema, options, errors) {
        var value = object[property], valid, type;

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

        if (schema.format && options.validateFormats) {
            var format = schema.format;

            if (! validate.formats[schema.format]) {
                if (options.validateFormatsStrict) {
                    return error('format', property, value, schema, errors);
//                    error('format', property, value, schema); // fixme check why returning
                }
            } else {
                if (! validate.formats[format].test(value)) {
                    return error('format', property, value, schema, errors);
//                    error('format', property, value, schema); // fixme check why returning
                }
            }
        }

        if (schema.enum && schema.enum.indexOf(value) === -1) {
            error('enum', property, value, schema, errors);
        }
        if (schema.requires && object[schema.requires] === undefined) {
            error('requires', property, null, schema, errors);
        }

        if (checkType(value, schema.type)) {
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
            error('type', property, typeof(value), schema, errors);
        }

        function constrain(name, value, assert) {
            if ((name in schema) && !assert(value, schema[name])) {
                error(name, property, value, schema, errors);
            }
        }
    };

    function checkType(val, type) {
        switch (type) {
            case 'string':  return typeof(val) === 'string';
            case 'array':   return Array.isArray(val);
            case 'object':  return val && (typeof(val) === 'object') && !Array.isArray(val);
            case 'number':  return typeof(val) === 'number';
            case 'integer': return typeof(val) === 'number' && (val % 1 === 0);
            case 'null':    return val === null;
            case 'boolean': return typeof(val) === 'boolean';
            case 'any':     return typeof(val) !== 'undefined';
            default:        return true;
        }
    };

    // TODO: figure out what schema.message(s) is referencing
    function error(attribute, property, actual, schema, errors) {
        var message = validate.messages && validate.messages[property] || "no default message";
        errors.push({
            attribute: attribute,
            property: property,
            expected: schema[attribute],
            actual: actual,
            message: message
        });
    }

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
    }

})(
    typeof(module) !== 'undefined' ? module.exports : (window.json = window.json || {})
);

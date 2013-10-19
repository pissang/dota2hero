function parse(str) {
    var config = {};

    var lines = str.split(/\n/);
    var currentCursor = 0;
    var nextCusor = 1;
    var currentLine = trim(lines[0]);
    var nextLine = trim(lines[1]);

    var currentObjContext = config;
    var contextStack = [];
    var enterContext = function(name) {
        if (!currentObjContext[name]) {
            currentObjContext[name] = {};
        }
        contextStack.push(currentObjContext);
        currentObjContext = currentObjContext[name];
    }
    var leaveContext = function() {
        currentObjContext = contextStack.pop();
    }
    var next = function() {
        currentCursor++;
        nextCusor++;

        currentLine = trim(lines[currentCursor]);
        nextLine = trim(lines[nextCusor]);

        if (currentLine === '') { // empty line
            next();
        }
    }

    var contextKey;
    while(!(contextStack.length && currentObjContext === undefined)) {
        if (currentLine === undefined) {
            if (contextStack.length) {
                throw new Error('Syntax Error');
            } else {
                break;
            }
        }
        if (currentLine === '{') {
            enterContext(contextKey);
            next();
            continue;
        } else if (currentLine === '}') {
            leaveContext(contextKey);
            next();
            continue;
        } else if (currentLine.indexOf('//') === 0) { // comment
            // next();
            // continue;
            currentLine = trim(currentLine.substr(2));
        }

        var items = currentLine.split(/[\s\t]+/g);
        var key = removeQuote(items[0]);
        var value = removeQuote(items.slice(1).join(' '));

        if (!value) {
            contextKey = key;
            next();
            continue;
        }
        else {
            currentObjContext[key] = parseValue(value);
            next();
            continue;
        }
    }

    return config;
}

function trim(str) {
    if (!str) {
        return str;
    }
    return str.replace(/(^[\s\t]*)|([\s\t]*$)/g, '');
}

function removeQuote(str) {
    if (!str) {
        return str;
    }
    return str.replace(/(^['"]*)|(['"]*$)/g, '');
}

function parseValue(val) {
    // is a number
    if (!isNaN(parseFloat(val))) {
        return parseFloat(val);
    } else {
        var arrayRegex = /\[\s*(.*?)\s*\]/;
        var res = arrayRegex.exec(val);
        if (res) {
            // array
            return res[1].split(/[\s\t]+/).map(function(item) {
                return parseFloat(item);
            });
        } else {
            // pure string
            return val;
        }
    }
}

exports.parse = parse;
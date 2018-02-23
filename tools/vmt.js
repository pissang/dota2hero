// VMT Parser
// https://github.com/pissang
function parse(str) {
  var config = {};

  var lines = str.split(/\n/);
  var currentCursor = 0;
  var nextCusor = 1;
  var currentLine = lines[0].trim();
  var nextLine = lines[1].trim();

  var currentObjContext = config;
  var contextStack = [];
  function enterContext(name) {
    if (!currentObjContext[name]) {
      currentObjContext[name] = {};
    }
    contextStack.push(currentObjContext);
    currentObjContext = currentObjContext[name];
  }
  function leaveContext() {
    currentObjContext = contextStack.pop();
  }
  function next() {
    currentCursor++;
    nextCusor++;

    if (currentCursor < lines.length) {
      currentLine = lines[currentCursor].trim();
      nextLine = (lines[nextCusor] || '').trim();

      if (!currentLine) { // empty line
        next();
      }
    }
    else {
      currentLine = null;
    }
  }

  var contextKey;
  while(!(contextStack.length && currentObjContext == null)) {
    if (currentLine == null) {
      if (contextStack.length) {
        throw new Error('Syntax Error');
      }
      else {
        break;
      }
    }
    if (currentLine === '{') {
      enterContext(contextKey);
      next();
      continue;
    }
    else if (currentLine === '}') {
      leaveContext(contextKey);
      next();
      continue;
    }
    else if (currentLine.startsWith('//')) { // comment
      next();
      continue;
    }

    var items = currentLine.split(/[\s\t]+/g);
    // Not case sensitive
    var key = removeQuote(items[0]).toLowerCase();
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


function removeQuote(str) {
  if (!str) {
    return str;
  }
  return str.replace(/(^['"]*)|(['"]*$)/g, '');
}

function parseValue(val) {
  // is a number
  if (!isNaN(parseFloat(val)) && val.match(/^[0-9.\-]*$/)) {
    return parseFloat(val);
  }
  else {
    var arrayRegex = /\[\s*(.*?)\s*\]/;
    var res = arrayRegex.exec(val);
    if (res) {
      // array
      return res[1].split(/[\s\t]+/).map(function(item) {
        return parseFloat(item);
      });
    }
    else if(val.indexOf(' ') >= 0) {
      // Array can be write as "1 1 1"
      return val.split(/[\s\t]+/).map(function(item) {
        return parseFloat(item);
      });
    }
    else {
      // pure string
      return val;
    }
  }
}

module.exports.parse = parse;

// safe characters to precced a regex (including `=>`, `**`, and `...`)
const beforeReChars = '[{(,;:?=|&!^~>%*/'

// keyword that can preceed a regex (`in` is handled as special case)
const beforeReWords = [
  'case',
  'default',
  //'delete',
  'do',
  'else',
  //'extends',
  'in',
  'instanceof',
  //'new',
  'prefix',
  'return',
  //'throw',
  'typeof',
  'void',
  'yield'
]

// matches characters for the keyword list
const R_KW = /[$\w]/
const R_WS = /\s/

// the string to test does not have line-endings
const R_RE = /^\/(?=[^*>/])[^[/\\]*(?:\\.|(?:\[(?:\\.|[^\]\\]*)*\])[^[\\/]*)*?\/(?=[gimuy]+|[^/\*]|$)/

function isInList(list, v) {
  return !!~list.indexOf(v)
}

/**
 * Check if the code in the `start` position can be a regex.
 *
 * @param   {string} code  - Buffer to test in
 * @param   {number} start - Position following the slash inside `code`
 * @returns {number} `true` if the slash can start a regex.
 */
export default function skipRegex(code, start) {

  const prev = function (n) {
    while (--n >= 0 && R_WS.test(code[n]));
    return n
  }

  const R_ANY = /.*/g
  R_ANY.lastIndex = start - 1
  const match = R_ANY.exec(code)[0].match(R_RE)

  if (match) {
    const next = match.index + match[0].length

    let pos = prev(start)
    let c

    // start of buffer or safe prefix?
    if (pos < 0 || isInList(beforeReChars, c = code[pos])) {
      return next
    }
    // from here, `pos` is >= 0 and `c` is code[pos]

    if (c === '.') {
      // can be `...` or something like 5./2
      if (code[pos - 1] === '.') {
        return next
      }

    } else if (c === '+' || c === '-') {
      // '++' and '--' cannot preceed a regex, except rare
      // cases like `x = ++/\s/.exec(s).lastIndex`
      if (code[--pos] !== c ||
          (pos = prev(pos)) < 0 ||
          isInList(beforeReChars, code[pos])) {
        return next
      }

    } else if (/[a-z]/.test(c)) {
      // keyword?
      const end = pos
      while (--pos >= 0) {
        if (!R_KW.test(code[pos])) break
      }
      if (isInList(beforeReWords, code.slice(pos + 1, end + 1))) {
        return next
      }
    }
  }

  return start
}

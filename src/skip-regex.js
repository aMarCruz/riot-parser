
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

// The string to test can't include line-endings
const R_RE = /^\/(?=[^*>/])[^[/\\]*(?:\\.|(?:\[(?:\\.|[^\]\\]*)*\])[^[\\/]*)*?\/(?=[gimuy]+|[^/\*]|$)/

// Searches the position of the previous non-blank character inside `code`,
// starting with `pos - 1`.
function prev(code, pos) {
  while (--pos >= 0 && /\s/.test(code[pos]));
  return pos
}

/**
 * Check if the code in the `start` position can be a regex.
 *
 * @param   {string} code  - Buffer to test in
 * @param   {number} start - Position following the slash inside `code`
 * @returns {number} `true` if the slash can start a regex.
 */
export default function skipRegex(code, start) {

  // `exec()` will extract from the slash to the end of line and the
  // chained `match()` will match the possible regex.
  const re = /.*/g
  re.lastIndex = start - 1
  const match = re.exec(code)[0].match(R_RE)

  if (match) {
    const next = start + match[0].length

    let pos = prev(code, start)
    const c = code[pos]

    // start of buffer or safe prefix?
    if (pos < 0 || ~beforeReChars.indexOf(c)) {
      return next
    }

    // from here, `pos` is >= 0 and `c` is code[pos]
    if (c === '.') {
      // can be `...` or something like 5./2
      if (code[pos - 1] === '.') {
        start = next
      }

    } else if (c === '+' || c === '-') {
      // exception here is '++' and '--' that cannot preceed a regex, except
      // in rare cases like `x = ++/\s/.exec(s).lastIndex`
      if (code[--pos] !== c ||
          (pos = prev(code, pos)) < 0 || ~beforeReChars.indexOf(code[pos])) {
        start = next
      }

    } else if (/[a-z]/.test(c)) {
      // keyword?
      ++pos
      for (let i = 0; i < beforeReWords.length; i++) {
        const kw = beforeReWords[i]
        const nn = pos - kw.length
        if (nn >= 0 && code.slice(nn, pos) === kw && !/[$\w]/.test(code[nn - 1])) {
          start = next
          break
        }
      }
    }
  }

  return start
}

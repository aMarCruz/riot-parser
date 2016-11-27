/**
 * @module HtmlParser
 * @version v$_VERSION
 */

import assign from './utils/object-assign-node'
import parseExpr from './expr-parser'

//#if !_T
import $_T from './nodetypes'
//#endif


// The htmlParser =========================================

/*
  It creates 4 node types, all of them has a start/end position
  (end points to the character following the node).

  TAG -- has `name` (ex. "div" or "/div"), `selfclose`, and `attrs` props.
  TEXT -- can have an `expr` property
  TEXT, COMMENT, DOCTYPE -- has no props other than `start`/`end`.

  TAG.attrs -- array of objects with `name`, `value` and `expr` props.

  expr -- array of objects with `loc`, its `start`/`end` props points
  to position into the parent, but loc is relative to the whole buffer.
*/

export default function htmlParser(options) {

  // Matches the start of valid tags names; used with the first 2 chars after '<'
  const R_TAG_START = /^\/?[a-zA-Z]/

  // Matches valid tags names AFTER the validation with R_TAG_START.
  // $1: tag name including any '/', $2: non self-closing brace (>) w/o attributes
  const R_TAG = /(\/?.[^\s>/]*)\s*(>)?/g

  // Matches the closing tag of a `script` block
  const R_SCRIPT_CLOSE = /<\/script\s*>/gi

  // Matches the closing tag of a `style` block
  const R_STYLE_CLOSE = /<\/style\s*>/gi

  // Matches an attribute name-value pair (both can be empty).
  // $1: attribute name, $2: value including any quotes
  const R_ATTR_NAME_VAL = /(\S[^>/=\s]*)(?:\s*=\s*([^>/])?)?/g


  options = assign({
    comments: false,
    brackets: ['{', '}']
  }, options)

  debugger
  const _parseExpr = parseExpr(options).parse


  return function parse(data) {

    const state = {
      pos: 0,
      output: [],
      last: null,
      loc: { pos: 0, line: 1, col: 0 },
      options: options
    }

    const result = {
      data: data,
      output: state.output
    }

    let mode = $_T.TEXT

    while (state.pos < data.length) {

      if (mode === $_T.TAG) {
        mode = _parseTag(state, data)

      } else if (mode === $_T.ATTR) {
        mode = _parseAttr(state, data)

      } else if (mode === $_T.TEXT) {
        mode = _parseText(state, data)

      } else {
        break
      }
    }

    if (mode !== $_T.TEXT) {
      _error(state, 'Unexpected end of file')
    }

    return result
  }

  // ------------------------------------------------------
  // Private methods
  // ------------------------------------------------------


  function _error(_state, msg) {
    throw new Error(msg)
  }


  function _escape(src) {
    const s = src[0] === '^' ? `\\${src}` : src
    return s.replace(/(?=[[()\-*+?.$|])/g, '\\')
  }


  /**
   * @param   {number}      type  - Numeric node type
   * @param   {string|null} name  - The node name, if null the node has no `name` property
   * @param   {number}      start - Start pos. For tags, this will point to '<'
   * @param   {number}      end   - End of this node. In tags this will point to the char
   *                                following the '>', in text nodes to the char afther
   *                                the text, so this is mustly the `re.lastIndex` value
   * @returns {object} A new node.
   */
  function _newNode(type, name, start, end) {
    const node = { type, start, end }

    if (name) {
      node.name = name
    }

    return node
  }


  /**
   * Stores a comment.
   *
   * @param   {Object}  _state - Current parser state
   * @param   {number}  start  - Start position of the tag
   * @param   {number}  end    - Ending position (last char of the tag)
   */
  function _pushComment(_state, start, end) {
    _state.last = null
    _state.pos  = end
    _state.output.push(_newNode($_T.COMMENT, null, start, end))
  }


  /**
   * Stores text in the last text node, or creates a new one if needed.
   *
   * @param   {Object}  _state - Current parser state
   * @param   {number}  start  - Start position of the tag
   * @param   {number}  end    - Ending position (last char of the tag)
   * @param   {Array}   [expr] - Found expressions
   */
  function _pushText(_state, start, end, expr) {
    const q = _state.last

    _state.pos = end
    if (q && q.type === $_T.TEXT) {
      q.end = end
    } else {
      _state.last = _newNode($_T.TEXT, null, start, end)
      _state.output.push(_state.last)
    }

    if (expr && expr.length) {
      const q2 = _state.last
      q2.expr = q2.expr ? q2.expr.concat(expr) : expr
    }
  }


  /**
   * Pushes a new *tag* and set `last` to this, so any attributes
   * will be included on this and shifts the `end`.
   *
   * @param   {object}  _state - Current parser state
   * @param   {object}  type   - Like nodeType
   * @param   {object}  name   - Name of the node including any slash
   * @param   {number}  start  - Start position of the tag
   * @param   {number}  end    - Ending position (last char of the tag)
   */
  function _pushTag(_state, type, name, start, end) {
    const tag = _newNode(type, name, start, end)

    tag.attrs = []
    _state.pos = end
    _state.output.push(_state.last = tag)
  }


  /**
   * Pushes a new attribute and shifts the `end` position of the tag (`last`).
   *
   * @param   {Object}  _state - Current parser state
   * @param   {Object}  attr   - Attribute
   */
  function _pushAttr(_state, attr) {
    const q = _state.last

    //assert(q && q.type === Mode.TAG, 'no previous tag for the attr!')
    _state.pos = q.end = attr.end
    q.attrs.push(attr)
  }


  /**
   * Parse the tag following a '<' character, or delegate to other parser
   * if an invalid tag name is found.
   *
   * @param   {object} _state - Parser state
   * @param   {string} _data  - Buffer to parse
   * @returns {number} New parser mode
   */
  function _parseTag(_state, _data) {
    const pos   = _state.pos                // pos of the char following '<'
    const start = pos - 1                   // pos of '<'
    const str   = _data.substr(pos, 2)      // first two chars following '<'

    if (str[0] === '!') {                   // doctype or comment?
      return _parseComment(_state, _data, start)
    }

    if (R_TAG_START.test(str)) {            // ^\/?[a-zA-Z]
      R_TAG.lastIndex = pos
      const match = R_TAG.exec(_data)       // (\/?.[^\s>/]*)\s*(>)? g
      const end   = R_TAG.lastIndex
      const name  = match[1].toLowerCase()  // $1: tag name including any '/'

      if (name === 'script' || name === 'style') {
        _state.scryle = name                // used by _parseText
      }

      _pushTag(_state, $_T.TAG, name, start, end)

      // only '>' can ends the tag here, the '/' is handled in _parseAttr
      if (match[2] !== '>') {               // $2: non self-closing brace w/o attr
        return $_T.ATTR
      }

    } else {
      _pushText(_state, start, pos)
    }

    return $_T.TEXT
  }


  /**
   * Parser for comments.
   * DOCTYPE & CDATA blocks are not recognized.
   *
   * @param   {object} _state - Parser state
   * @param   {string} _data  - Buffer to parse
   * @param   {number} start  - Position of the '<!' sequence
   * @returns {number} New parser mode (always TEXT).
   */
  function _parseComment(_state, _data, start) {
    const pos = start + 2                   // skip '<!'
    const str = _data.substr(pos, 2) === '--' ? '-->' : '>'

    let end = _data.indexOf(str, pos)
    if (end < 0) {
      _error(_state, 'Unclosed comment')
    }
    end += str.length

    _pushComment(_state, start, end)

    return $_T.TEXT
  }


  /**
   * The more complex parsing is for attributes.
   *
   * @param   {object} _state - Parser state
   * @param   {string} _data  - Buffer to parse
   * @returns {number} New parser mode.
   */
  function _parseAttr(_state, _data) {
    const _C = /\S/g                        // matches the first non-space char

    _C.lastIndex = _state.pos
    let match = _C.exec(_data)
    if (!match) {
      _error(_state, 'Unfinished tag')
    }

    const tag = _state.last               // the last tag in the output
    const ch  = match[0]

    if (ch === '>') {                     // tag ends?
      _state.pos = tag.end = _C.lastIndex // done w/attr, end is after '>' now
      return $_T.TEXT
    }

    if (ch === '/') {                     // self closing tag?
      match = _C.exec(_data)
      if (!match) {
        _error(_state, 'Unfinished tag')
      }

      if (match[0] === '>') {
        tag.selfclose = true
        _state.pos = tag.end = _C.lastIndex
        return $_T.TEXT
      }

      // Skip this char. This mimic the behavior of Chrome,
      // skipping the slash even if a closing '>' does not follows this.
      _state.pos = match.index
      return $_T.ATTR
    }

    // R_ATTR_NAME_VAL = /(\S[^>/=\s]*)(?:\s*=\s*([^>/])?)?/g
    const start = match.index             // first non-whitespace
    R_ATTR_NAME_VAL.lastIndex = start
    match       = R_ATTR_NAME_VAL.exec(_data)
    const end   = R_ATTR_NAME_VAL.lastIndex
    const value = match[2] || ''          // first letter of value or nothing

    const attr  = { name: match[1].toLowerCase(), value, start, end }

    if (value) {
      _parseValue(_state, _data, attr, value, end)
    }
    _pushAttr(_state, attr, match.expr)

    return $_T.ATTR
  }


  /**
   * Parse value for expressions
   *
   * @param   {object} _state - Parser state
   * @param   {string} _data  - Buffer to parse
   * @param   {object} attr   - Attribute as {name, value, start, end}
   * @param   {string} quote  - First char of the attribute value
   * @param   {number} start  - Position of the char following the `quote`
   * @returns {object} The attribute
   */
  function _parseValue(_state, _data, attr, quote, start) {

    // Usually, the value's first char (`quote`) is a quote. If not, this is
    // an unquoted value and we need adjust the start position.
    if (quote !== '"' && quote !== "'") {
      quote = ''                            // first char of the value is not a quote
      start--                               // move the start to this char
    }

    // Dynamically, make a regexp that matches the closing quote (ending char
    // for unquoted values) or an opening brace of an expression.
    const brace = _state.options.brackets[0]
    const re    = RegExp(`${quote || '[>/\\s]'}|${_escape(brace)}`, 'g')
    const pos   = start
    const expr  = []
    let mm, end

    while (1) {             //eslint-disable-line no-constant-condition
      re.lastIndex = start
      mm = re.exec(_data)
      if (!mm) {
        _state.pos = attr.start
        _error(_state, 'Unfinished attribute')
      }
      if (mm[0] !== brace) {
        break                               // the attribute ends
      }
      start = mm.index                      // may have an expression
      end = _parseExpr(_data, start)
      if (~end) {
        expr.push({ start, end })
        start = end
      } else {
        start += brace.length
      }
    }

    end = mm.index
    attr.value = _data.slice(pos, end)
    attr.end = quote ? end + 1 : end

    if (expr.length) {
      attr.expr = expr
    }

    return attr
  }


  /**
   * Parses regular text and script/style blocks ...scryle for short :-)
   * (the content of script and style is text as well)
   *
   * @param   {object} _state - Parser state
   * @param   {string} _data  - Buffer to parse
   * @returns {number} New parser mode
   */
  function _parseText(_state, _data) {
    const pos = _state.pos                  // pos of the char following '<'

    if (_state.scryle) {
      const name = _state.scryle
      const re   = name === 'script' ? R_SCRIPT_CLOSE : R_STYLE_CLOSE

      re.lastIndex = pos
      const match = re.exec(_data)
      if (!match) {
        _error(_state, `Unclosed tag "${name}"`)
      }
      const start = match.index
      const end   = re.lastIndex
      _state.scryle = ''                    // no error, so reset the flag now

      // write the tag content, if any
      if (start > pos) {
        _pushText(_state, pos, start)
      }
      // now the closing tag, either </script> or </style>
      _pushTag(_state, $_T.TAG, `/${name}`, start, end)

    } else if (_data[pos] === '<') {
      _state.pos++
      return $_T.TAG

    } else {
      const pos1 = _data.indexOf('<', pos)
      const pos2 = _data.indexOf(_state.options.brackets[0], pos)

      if (~pos2 && (pos1 < 0 || pos1 > pos2)) {
        return _pushTextExpr(_state, _data, pos2)
      }

      if (~pos1) {
        _pushText(_state, pos, pos1)
        _state.pos++
        return $_T.TAG
      }

      _pushText(_state, pos, _data.length)  // all remaining is text
    }

    return $_T.TEXT
  }


  function _pushTextExpr(_state, _data, start) {
    const brace = _state.options.brackets[0]
    const expr  = []
    const re    = new RegExp(`<|${_escape(brace)}`, 'g')

    let end, mm

    do {
      end = _parseExpr(_data, start)
      if (~end) {
        expr.push({ start, end })
      } else {
        end = start + brace.length
      }
      re.lastIndex = end
      mm = re.exec(_data)
      start = mm ? mm.index : _data.length
    } while (mm && mm[0] !== '<')

    _pushText(_state, _state.pos, start, expr)

    return $_T.TEXT
  }


  /*
    Updates the global position
  */
  /*
  function _getLoc (_state, _data, start) {
    const loc = _state.loc

    let col = loc.col
    let pos = loc.pos
    if (pos < start) {
      const re = /\r\n?|\n/g    // eols of any type (unix/mac/win)

      _data = _data.slice(pos, start)

      let lines = pos = 0

      while (re.exec(_data)) {
        pos = re.lastIndex
        lines++
      }

      if (lines) {
        loc.line += lines
        col = 0
      }
      loc.col = col += _data.length - pos
      loc.pos = start
    }

    return { line: loc.line, col }
  }
  */
}

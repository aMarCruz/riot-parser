/**
 * @module HtmlParser
 * @version v$_VERSION
 */

import assign from './utils/assign'
import extractExpr from './extract-expr'

//#if !_T
import $_T from './nodetypes'
//#endif


// The HtmlParser class ===============================================

function HtmlParser(options) {

  this.options = assign({
    comments: false,
    brackets: ['{', '}']
  }, options)

  this.extractExpr = extractExpr(this.options)
  this.parse = this._parse.bind(this)
  this._re = {}
}


// HtmlParser methods and properties ==================================

assign(HtmlParser.prototype, {

  nodeTypes: {
    TAG:      $_T.TAG,          // ELEMENT_NODE (tag)
    ATTR:     $_T.ATTR,         // ATTRIBUTE_NODE (attribute)
    TEXT:     $_T.TEXT,         // TEXT_NODE (#text)
    COMMENT:  $_T.COMMENT,      // COMMENT_NODE (#comment)
    DOCTYPE:  $_T.DOCTYPE,      // DOCUMENT_TYPE_NODE (html)
    EXPR:     $_T.EXPR          // DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC (riot)
  },

  /*
    It creates a raw output of pseudo-nodes with one of three different types,
    all of them having a start/end information.
    (`end` points to the character following the node).

    TAG     -- has `name` (ex. "div" or "/div"), `selfclose`, and `attrs`.
    TEXT    -- can have an `expr` property in addition to start/end.
    COMMENT -- has no props other than start/end.

    `TAG.attrs` is an array of objects with `name`, `value` and `expr` props.

    `expr` is an array of objects with start/end properties, relative to the
    whole buffer.
  */
  _parse(data) {

    const output = []
    const state = {
      pos: 0,
      last: null,
      options: this.options,
      output
    }

    const length = data.length
    let type = $_T.TEXT

    while (state.pos < length) {

      if (type === $_T.TEXT) {
        type = this.parseText(state, data)

      } else if (type === $_T.TAG) {
        type = this.parseTag(state, data)

      } else if (type === $_T.ATTR) {
        type = this.parseAttr(state, data)

      } else {
        break
      }
    }

    if (type !== $_T.TEXT) {
      this.error(state, data, 'Unexpected end of file')
    }

    return { data, output }
  },

  /**
   * Minimal error handler.
   * The `state` object includes the buffer (`data`)
   * The error position (`loc`) contains line (base 1) and col (base 0).
   *
   * @param   {object} state    - Current parser state
   * @param   {object} loc      - Line and column of the error
   * @param   {string} message  - Error message
   */
  displayError(state, loc, message) {
    message = `[${loc.line},${loc.col}]: ${message}`
    throw new Error(message)
  },

  /**
   * On error translates the current position to line, col and calls the
   * error method of the class.
   *
   * @param   {object} state - Current parser state
   * @param   {string} data  - Processing buffer
   * @param   {string} msg   - Error message
   * @param   {number} [pos] - Error position
  */
  error(state, data, msg, pos) {
    if (pos == null) pos = state.pos

    // count unix/mac/win eols
    const line = (data.slice(0, pos).match(/\r\n?|\n/g) || '').length + 1

    let col = 0
    while (--pos >= 0 && !/[\r\n]/.test(data[pos])) {
      ++col
    }

    state.data = data
    this.displayError(state, { line, col }, msg)
  },

  /**
   * Creates a global regex for the given string and the left bracket.
   *
   * @param   {string} str - String to add
   * @returns {RegExp} The resulting regex.
   */
  _b0regex(str) {
    let re = this._re[str]
    if (!re) {
      const b0 = this.options.brackets[0].replace(/(?=[[^()\-*+?.$|])/g, '\\')
      this._re[str] = re = new RegExp(`${str}|${b0}`, 'g')
    }
    return re
  },

  /**
   * @param   {number}      type  - Numeric node type
   * @param   {string|null} name  - The node name, if null the node has no `name` property
   * @param   {number}      start - Start pos. For tags, this will point to '<'
   * @param   {number}      end   - End of this node. In tags this will point to the char
   *                                following the '>', in text nodes to the char afther
   *                                the text, so this is mustly the `re.lastIndex` value
   * @returns {object} A new node.
   */
  newNode(type, name, start, end) {
    const node = { type, start, end }

    if (name) {
      node.name = name
    }

    return node
  },

  /**
   * Stores a comment.
   *
   * @param   {Object}  state - Current parser state
   * @param   {number}  start - Start position of the tag
   * @param   {number}  end   - Ending position (last char of the tag)
   */
  pushComment(state, start, end) {
    state.last = null
    state.pos  = end
    if (state.options.comments) {
      state.output.push(this.newNode($_T.COMMENT, null, start, end))
    }
  },

  /**
   * Stores text in the last text node, or creates a new one if needed.
   *
   * @param   {Object}  state  - Current parser state
   * @param   {number}  start  - Start position of the tag
   * @param   {number}  end    - Ending position (last char of the tag)
   * @param   {Array}   [expr] - Found expressions
   * @param   {string}  [rep]  - Escaped brackets to replace
   */
  pushText(state, start, end, expr, rep) {
    let q = state.last

    state.pos = end
    if (q && q.type === $_T.TEXT) {
      q.end = end
    } else {
      state.last = q = this.newNode($_T.TEXT, null, start, end)
      state.output.push(q)
    }

    if (expr && expr.length) {
      q.expr = q.expr ? q.expr.concat(expr) : expr
    }

    if (rep) q.replace = rep
  },

  /**
   * Pushes a new *tag* and set `last` to this, so any attributes
   * will be included on this and shifts the `end`.
   *
   * @param   {object}  state - Current parser state
   * @param   {object}  type  - Like nodeType
   * @param   {object}  name  - Name of the node including any slash
   * @param   {number}  start - Start position of the tag
   * @param   {number}  end   - Ending position (last char of the tag + 1)
   */
  pushTag(state, type, name, start, end) {
    const tag = this.newNode(type, name, start, end)

    state.pos = end
    state.output.push(state.last = tag)
  },

  /**
   * Pushes a new attribute and shifts the `end` position of the tag (`last`).
   *
   * @param   {Object}  state - Current parser state
   * @param   {Object}  attr  - Attribute
   */
  pushAttr(state, attr) {
    const q = state.last

    //assert(q && q.type === Mode.TAG, 'no previous tag for the attr!')
    state.pos = q.end = attr.end
    if (q.attrs) q.attrs.push(attr)
    else q.attrs = [attr]
  },

  // Matches the start of valid tags names; used with the first 2 chars after '<'
  TAG_OPEN: /^\/?[a-zA-Z]/,

  // Matches valid tags names AFTER the validation with R_TAG_START.
  // $1: tag name including any '/', $2: non self-closing brace (>) w/o attributes
  TAG_NAME: /(\/?[^\s>/]+)\s*(>)?/g,

  /**
   * Parse the tag following a '<' character, or delegate to other parser
   * if an invalid tag name is found.
   *
   * @param   {object} state - Parser state
   * @param   {string} data  - Buffer to parse
   * @returns {number} New parser mode
   */
  parseTag(state, data) {
    const pos   = state.pos                 // pos of the char following '<'
    const start = pos - 1                   // pos of '<'
    const str   = data.substr(pos, 2)       // first two chars following '<'

    if (str[0] === '!') {                   // doctype, cdata, or comment
      return this.parseComment(state, data, start)
    }

    if (this.TAG_OPEN.test(str)) {          // ^\/?[a-zA-Z]
      const re = this.TAG_NAME
      re.lastIndex = pos
      const match = re.exec(data)           // (\/?[^\s>/]+)\s*(>)? g
      const end   = re.lastIndex
      const name  = match[1].toLowerCase()  // $1: tag name including any '/'

      // script/style block is parsed as another tag to extract attributes
      if (name === 'script' || name === 'style') {
        state.scryle = name                 // used by parseText
      }

      this.pushTag(state, $_T.TAG, name, start, end)

      // only '>' can ends the tag here, the '/' is handled in parseAttr
      if (match[2] !== '>') {               // $2: non self-closing brace w/o attr
        return $_T.ATTR
      }

    } else {
      this.pushText(state, start, pos)
    }

    return $_T.TEXT
  },

  /**
   * Parses comments in long or short form
   * (any DOCTYPE & CDATA blocks are parsed as comments).
   *
   * @param   {object} state - Parser state
   * @param   {string} data  - Buffer to parse
   * @param   {number} start - Position of the '<!' sequence
   * @returns {number} New parser mode (always TEXT).
   */
  parseComment(state, data, start) {
    const pos = start + 2                   // skip '<!'
    const str = data.substr(pos, 2) === '--' ? '-->' : '>'
    const end = data.indexOf(str, pos)

    if (end < 0) {
      this.error(state, data, 'Unclosed comment', start)
    }

    this.pushComment(state, start, end + str.length)

    return $_T.TEXT
  },

  // Matches an attribute name-value pair (both can be empty).
  // $1: attribute name, $2: value including any quotes
  ATTR_START: /(\S[^>/=\s]*)(?:\s*=\s*([^>/])?)?/g,

  /**
   * The more complex parsing is for attributes.
   *
   * @param   {object} state - Parser state
   * @param   {string} data  - Buffer to parse
   * @returns {number} New parser mode.
   */
  parseAttr(state, data) {
    const tag = state.last                  // the last tag in the output
    const _CH = /\S/g                       // matches the first non-space char

    _CH.lastIndex = state.pos               // point to the start of the name
    let match = _CH.exec(data)

    if (!match) {
      state.pos = data.length               // return ATTR with this will generate error

    } else if (match[0] === '>') {
      state.pos = tag.end = _CH.lastIndex
      return $_T.TEXT

    } else if (match[0] === '/') {          // self closing tag?
      state.pos = _CH.lastIndex
      tag.selfclose = true

    } else {
      delete tag.selfclose

      const re    = this.ATTR_START         // (\S[^>/=\s]*)(?:\s*=\s*([^>/])?)? g
      const start = re.lastIndex = match.index  // first non-whitespace
      match       = re.exec(data)
      const end   = re.lastIndex
      const value = match[2] || ''          // first letter of value or nothing

      const attr  = { name: match[1].toLowerCase(), value, start, end }

      if (value) {
        this.parseValue(state, data, attr, value, end)
      }

      this.pushAttr(state, attr)
    }

    return $_T.ATTR
  },

  /**
   * Parses an attribute value for expressions.
   *
   * @param   {object} state - Parser state
   * @param   {string} data  - Whole buffer
   * @param   {object} attr  - Attribute as {name, value, start, end}
   * @param   {string} quote - First char of the attribute value
   * @param   {number} start - Position of the char following the `quote`
   */
  parseValue(state, data, attr, quote, start) {

    // Usually, the value's first char (`quote`) is a quote. If not, this is
    // an unquoted value and we need adjust the start position.
    if (quote !== '"' && quote !== "'") {
      quote = ''                            // first char of value is not a quote
      start--                               // move the start to this char
    }

    // Dynamically, make a regexp that matches the closing quote (ending char
    // for unquoted values) or an opening brace of an expression.
    const re = this._b0regex(`(${quote || '[>/\\s]'})`)
    const expr = []
    let mm, tmp

    re.lastIndex = start
    while (1) {                             // eslint-disable-line
      mm = re.exec(data)
      if (!mm) {
        this.error(state, data, 'Unfinished attribute', start)
      }
      if (mm[1]) {
        break                               // the attribute ends
      }
      tmp = this.extractExpr(data, mm.index)
      if (tmp) {
        if (typeof tmp == 'string') {
          attr.replace = tmp
        } else {
          expr.push(tmp)
          re.lastIndex = tmp.end
        }
      }
    }

    const end = mm.index
    attr.value = data.slice(start, end)
    attr.valueStart = start
    attr.end = quote ? end + 1 : end
    if (expr.length) {
      attr.expr = expr
    }
  },

  // Matches the closing tag of a `script` block
  SCRIPT_CLOSE: /<\/script\s*>/gi,

  // Matches the closing tag of a `style` block
  STYLE_CLOSE: /<\/style\s*>/gi,

  /**
   * Parses regular text and script/style blocks ...scryle for short :-)
   * (the content of script and style is text as well)
   *
   * @param   {object} state - Parser state
   * @param   {string} data  - Buffer to parse
   * @returns {number} New parser mode.
   */
  parseText(state, data) {
    const pos = state.pos                  // start of the text

    if (state.scryle) {
      const name = state.scryle
      const re   = name === 'script' ? this.SCRIPT_CLOSE : this.STYLE_CLOSE

      re.lastIndex = pos
      const match = re.exec(data)
      if (!match) {
        this.error(state, data, `Unclosed "${name}" block`, pos - 1)
      }
      const start = match.index
      const end   = re.lastIndex
      state.scryle = ''                    // no error, so reset the flag now

      // write the tag content, if any
      if (start > pos) {
        this.pushText(state, pos, start)
      }
      // now the closing tag, either </script> or </style>
      this.pushTag(state, $_T.TAG, `/${name}`, start, end)

    } else if (data[pos] === '<') {
      state.pos++
      return $_T.TAG

    } else {
      const re = this._b0regex('<')

      re.lastIndex = pos
      let mm = re.exec(data)
      let expr
      let rep

      while (mm && mm[0] !== '<') {
        const tmp = this.extractExpr(data, mm.index)
        if (tmp) {
          if (typeof tmp == 'string') {
            rep = tmp
          } else {
            (expr || (expr = [])).push(tmp)
            re.lastIndex = tmp.end
          }
        }
        mm = re.exec(data)
      }

      // if no '<' found, all remaining is text
      const end = mm ? mm.index : data.length
      this.pushText(state, pos, end, expr, rep)
    }

    return $_T.TEXT
  }

})

export default function htmlParser(options) {
  return new HtmlParser(options)
}

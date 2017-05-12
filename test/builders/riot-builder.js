/**
 * Simple html builder...
 *
 * - Regular text:
 *   Whitespace compression, incluing text in `style` sections (Optional removal of whitespace-only text).
 * - Tags names:
 *   Removes extra whitespace and convert names to lowercase, except DOCTYPE that is uppercased.
 * - Self-closing tags:
 *   Removes the '/' and, if is not a void tag, adds the closing tag.
 * - Closing void tags:
 *   Raises error.
 * - Attributes:
 *   Removes extra whitespace, convert names to lowercase, removes empty values, and enclose values in double quotes.
 * - Comments:
 *   Convertion of short notation (`<! >`) to regular (`<!-- -->`).
 *
 * Throws on unclosed tags or closing tags without start tag.
 *
 * @class RiotBuilder
 */
const VOID_TAGS = require('./void-tags')
const T = require('../../')().nodeTypes

// Do not touch text content inside this tags
const RE_PRE = /^\/?(?:pre|script|style|textarea)$/

const $_BP_LEFT  = '{%'
const $_BP_RIGHT = '%}'

// Class htmlBuilder ======================================

function RiotBuilder(options) {

  this.options = options || {}
  this.build = this._build.bind(this)
  this.reset()

}


Object.assign(RiotBuilder.prototype, {

  reset() {
    this.options.compact = this.options.compact !== false
    this.riotTag = ''
    this.exprIdx = 0
    this.expressions = {}
    this.tags = []
    this.scripts = []
    this.styles = []
    this._stack = []
    this._raw = 0
    this._output = this.tags
  },

  /**
   * Exposed as htmlBuilder.build
   *
   * @param   {object} input - Original code and array of pseudo-nodes
   * @returns {string} HTML output
   */
  _build(input) {

    const nodes = input.output
    const data = input.data
    this.reset()
    debugger
    this.riotTag = this.getRiotTag(input.root)

    for (let pos = 0; pos < nodes.length; pos++) {
      const node = nodes[pos]

      if (node.type !== T.TAG) {
        // not a container element...
        if (node.type === T.TEXT && !this.stop) {
          this.printText(node, data)
        }

      } else {
        const name = node.name

        if (name[0] !== '/') {
          // is not a closing tag
          if (name === 'script' || name === 'style') {
            this._output = this[name + 's']
          }
          this.openTag(node)

        } else {
          // closing another tag, pop the stack
          this.closeTag(name)
          // if closing script/style
          this._output = this.tags
        }
      }
    }

    if (this._stack.length) {
      throw new Error('unexpected end of file')
    }

    const out = [this.tags.join('')]
    if (this.styles) out.push(this.styles.join(''))
    if (this.scripts) out.push(this.scripts.join(''))
    if (this.expressions) out.push(JSON.stringify(this.expressions, null, '  '))

    return out.join('\n')
  },

  closeTag(name) {
    const last = this._stack.pop()

    if (last !== name.slice(1)) {
      const err = last
        ? `expected "</${last}>" and instead saw "<${name}>".`
        : `unexpected closing tag "<${name}>".`

      throw new Error(err)
    }

    if (VOID_TAGS.test(last)) {
      throw new Error(`unexpected closing tag for void element "<${last}>".`)
    }

    this._output.push(`<${name}>`)
    if (RE_PRE.test(name)) --this._raw
  },

  openTag(node) {
    const name   = node.name
    const allTag = [name]

    if (node.attrs) {
      node.attrs.forEach(a => {
        const value = this.parseNode(a, a.value, a.valueStart)
        allTag.push(value ? `${a.name}="${value}"` : a.name)
      })
    }

    this._output.push(`<${allTag.join(' ')}>`)

    if (VOID_TAGS.test(name)) return

    if (node.selfclose) {
      this._output.push(`</${name}>`)
    } else {
      this._stack.push(name)
      if (RE_PRE.test(name)) ++this._raw
    }
  },

  printText(node, data) {
    if (node.type === T.TEXT) {
      const compact = !this._raw && this.options.compact
      let text = data.slice(node.start, node.end)

      if (compact && !/\S/.test(text)) {
        return
      }

      text = this.parseNode(node, text, node.start)
      if (compact) {
        text = text.replace(/\s+/g, ' ')
      }
      this._output.push(text)
    }
  },

  pushExpr(type, expr) {
    const ekey = `${this.riotTag}:${++this.exprIdx}`
    expr.type = type === T.TEXT ? 'T' : 'V'
    this.expressions[ekey] = expr
    return ekey
  },

  _re: {},

  parseNode(node, code, offset) {
    const exprList = node.expr
    const repChar = node.replace

    if (exprList) {
      const parts = []
      let pos = 0
      debugger
      for (let i = 0; i < exprList.length; i++) {
        const expr = exprList[i]
        const ekey = this.pushExpr(node.type, expr)
        parts.push(`${code.slice(pos, expr.start - offset)}${$_BP_LEFT}${ekey}${$_BP_RIGHT}`)
        pos = expr.end - offset
      }
      if (pos + offset < node.end) parts.push(code.slice(pos))
      code = parts.join('')
    }

    if (repChar) {
      const re = this._re[repChar] || (this._re[repChar] = RegExp(`\\${repChar}`, 'g'))
      code = code.replace(re, repChar)
    }

    return code
  },

  getRiotTag(node) {
    if (node.attrs) {
      const attr = node.attrs.find(a => a.name === 'data-is' || a.name === 'data-riot-tag')
      if (attr) {
        return attr.value
      }
    }
    return node.name
  }

})

module.exports = function riotBuilder(options) {
  return new RiotBuilder(options)
}

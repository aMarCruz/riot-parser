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
 * @module htmlbuilder
 */

const VOID_TAGS = require('./void-tags')
const T = require('../../')().nodeTypes

// Do not touch text content inside this tags
const R_PRE = /^\/?(?:pre|textarea|script|style)$/

// Class htmlBuilder ======================================

function HtmlBuilder(options) {

  this.options = options || {}
  this.build = this._build.bind(this)
  this.reset()

}


Object.assign(HtmlBuilder.prototype, {

  reset() {
    this.options.compact = this.options.compact !== false
    this._output = []
    this._stack = []
    this._raw = 0
  },

  /**
   * Exposed as htmlBuilder.build
   *
   * @param   {object} input - Original code and array of pseudo-nodes
   * @returns {string} HTML output
   */
  _build(input) {

    const flat = input.output
    this.reset()
    this._data = input.data

    for (let pos = 0; pos < flat.length; pos++) {
      const node = flat[pos]

      if (node.type !== T.TAG) {
        // not a container element...
        this.printOther(node)

      } else {
        const name = node.name

        if (name[0] !== '/') {
          // is not a closing tag
          this.openTag(node)

        } else {
          // closing tag, pop the stack
          this.closeTag(name)
        }
      }
    }

    if (this._stack.length) {
      throw new Error('unexpected end of file')
    }

    return this._output.join('')
  },

  closeTag(name) {
    const last = this._stack.pop()

    if (last !== name.slice(1)) {
      const err = last
        ? `expected "</${last}>" and instead saw "<${name}>"`
        : `unexpected closing tag "<${name}>"`

      throw new Error(err)
    }

    this._output.push(`<${name}>`)
    if (R_PRE.test(name)) --this._raw
  },

  openTag(node) {
    const name   = node.name
    const allTag = [name]

    if (node.attrs) {
      node.attrs.forEach(a => {
        const s = a.name
        allTag.push(a.value ? `${s}="${a.value.replace(/"/g, '&quot;')}"` : s)
      })
    }

    this._output.push(`<${allTag.join(' ')}>`)

    if (VOID_TAGS.test(name)) return

    if (node.selfclose) {
      this._output.push(`</${name}>`)
    } else {
      this._stack.push(name)
      if (R_PRE.test(name)) ++this._raw
    }
  },

  printOther(node) {
    let text = this._data.slice(node.start, node.end)

    switch (node.type) {
      case T.COMMENT:
        if (text.substr(2, 2) !== '--') {
          text = `<!--${text.slice(2, -1)}-->`
        }
        break

      case T.TEXT:
        if (!this._raw && this.options.compact) {
          if (!/\S/.test(text)) return
          text = text.replace(/\s+/g, ' ')
        }
        break
    }
    this._output.push(text)
  }

})

module.exports = function htmlBuilder(options) {
  return new HtmlBuilder(options)
}

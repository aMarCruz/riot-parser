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

//#if !_T
import $_T from './nodetypes'
//#endif

import VOID_TAGS from './void-tags'


// Class htmlBuilder ======================================

function htmlBuilder(options) {
  if (!options) options = {}

  // Do not touch text content inside this tags
  const R_PRE = /^\/?(?:pre|script)$/

  // Closure data, changed on reset()
  let _output
  let _stack
  let _qText
  let _done
  let _raw
  let _cb

  const _builder = {
    /*
      Resets the builder back to starting state
    */
    reset(callback) {
      _output = []
      _stack  = []
      _qText  = ''
      _done   = false          // indicates whether the parsing has been completed
      _raw    = 0
      _cb = typeof callback == 'function' ? callback : _defcb
    },

    /*
      Writes a node or element
    */
    write(node) {             //eslint-disable-line complexity
      if (_done) {
        this.done(new Error('writing after done() is not allowed without reset()'))
        return
      }

      if (node.type !== $_T.TAG) {
        // not a container element...
        _printOther(node)

      } else {
        const name = node.name

        if (name[0] !== '/') {
          // is not a closing tag
          _openTag(node)

        } else {
          // closing tag, pop the stack
          _closeTag(name)
        }
      }
    },

    /*
      Signals the builder that parsing is done
    */
    done(err) {
      if (_stack.length) {
        err = err || new Error('unexpected end of file')
      } else {
        _flushText()
      }
      _done = true
      if (err) {
        _cb(err)
      } else {
        _cb(null, this.getOutput())
      }
    },

    /*
      Returns the nodes
    */
    getOutput() {
      return _output.join('')
    }
  }

  _builder.reset()
  return _builder


  // Private methods ======================================

  function _flushText() {
    let text = _qText
    if (text) {
      _qText = ''

      if (!_raw) {
        text = text.replace(/\s+/g, ' ')
        if (options.compact && text === ' ') {
          return
        }
      }
      _output.push(text)
    }
  }

  function _closeTag(name) {
    const last = _stack.pop()

    if (last !== name.slice(1)) {
      const err = last
        ? `expected "</${last}>" and instead saw "<${name}>"`
        : `unexpected closing tag "<${name}>"`
      _builder.done(new Error(err))

    } else {
      _flushText()
      _output.push(`<${name}>`)
      if (R_PRE.test(name)) --_raw
    }
  }

  function _openTag(node) {
    const name = node.name
    const attr = node.attrs || ''

    const allTag = [name]
    if (attr.length) {
      attr.forEach(a => {
        const s = a.name
        allTag.push(a.value ? `${s}="${a.value.replace(/"/g, '&quot;')}"` : s)
      })
    }

    _flushText()
    _output.push(`<${allTag.join(' ')}>`)

    if (VOID_TAGS.test(name)) return

    if (node.selfclose) {
      _output.push(`</${name}>`)
    } else {
      _stack.push(name)
      if (R_PRE.test(name)) ++_raw
    }
  }

  function _printOther(node) {
    let text = node.raw

    switch (node.type) {
      case $_T.COMMENT:
        text = text.substr(2, 2) === '--'
             ? text : `<!--${text.slice(2, -1)}-->`
        break
      case $_T.TEXT:
        _qText += text
        return
    }

    _flushText()
    _output.push(text)
  }

  /*
    Default callback throws if there was any error.
  */
  function _defcb(err) {
    if (err) throw err
  }

}

export default htmlBuilder

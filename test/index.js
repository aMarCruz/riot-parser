'use strict'

const compareObject = require('./utils/compare-objects')
const htmlParser = require('../')
const expect = require('expect')
const fs = require('fs')

process.chdir(__dirname)

describe('The Parser', function () {

  const theTests = require('./tparser')
  const titles = Object.keys(theTests)

  const _TDEBUG = 'html5 doctype'

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i]

    it(title, function () {
      const test  = theTests[title]
      const parse = htmlParser(test.options).parse

      if (_TDEBUG && title === _TDEBUG) debugger

      if (test.throws) {
        expect(function () { parse(test.data) }).toThrow(test.throws)

      } else {
        let result = parse(test.data)
        let expected
        if (compareObject(result.output, test.expected)) {
          result = expected = 1
        } else {
          result   = JSON.stringify(result.output)
          expected = JSON.stringify(test.expected)
        }
        expect(result).toBe(expected)
      }
    })

    if (_TDEBUG && title === _TDEBUG) break
  }

})


describe('Expressions', function () {

  const theTests = require('./texpr')
  const titles = Object.keys(theTests)

  const _TDEBUG = 0 // 'Simple string with embeded brackets'

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i]

    it(title, function () {
      const test  = theTests[title]
      const parse = htmlParser(test.options).parse
      //const builder = parser.builder

      if (_TDEBUG && title === _TDEBUG) debugger

      let result = parse(test.data)

      if (test.throws) {
        expect(result.error).toMatch(test.throws)

      } else {
        let expected = 1
        if (compareObject(result.output, test.expected)) {
          result = 1
        } else {
          result   = JSON.stringify(result.output)
          expected = JSON.stringify(test.expected)
        }
        expect(result).toBe(expected)
      }
    })

    if (_TDEBUG && title === _TDEBUG) break
  }

})


describe('HTML Builder', function () {

  const htmlBuilder = require('./builders/htmlbuilder')
  const theTests = require('./thtmlbuilder')
  const titles = Object.keys(theTests)

  const _TDEBUG = 0//'Throws on closing *void* tags'

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i]

    it(title, function () {
      const test    = theTests[title]
      const parser  = htmlParser(test.options)
      const builder = htmlBuilder(test.builderOptions)

      if (_TDEBUG && title === _TDEBUG) debugger

      if (test.throws) {
        expect(function () {
          builder.build(parser.parse(test.data))
        }).toThrow(test.throws)

      } else {
        const result = builder.build(parser.parse(test.data))
        expect(result).toBe(test.expected)
      }
    })

    if (_TDEBUG && title === _TDEBUG) break
  }

})


describe('HTML Builder 2', function () {

  const htmlBuilder = require('./builders/htmlbuilder')

  it('test 1', function () {
    const source  = fs.readFileSync('tags/loop-svg-nodes.tag', 'utf8').trim()
    const parser  = htmlParser()
    const builder = htmlBuilder({ compact: false })
    const expected = [
      '<loop-svg-nodes>',
      '  <svg>',
      '    <circle each="{ points }" riot-cx="{ x * 10 + 5 }" riot-cy="{ y * 10 + 5 }" r="2" fill="black"></circle>',
      '  </svg>',
      '  <p>Description</p>',
      '  <loop-svg-nodes></loop-svg-nodes>',
      '  <loop-svg-nodes></loop-svg-nodes>',
      '',
      '  <script>',
      "  this.points = [{'x': 1,'y': 0}, {'x': 9, 'y': 6}, {'x': 4, 'y': 7}]",
      '  </script>',
      '',
      '</loop-svg-nodes>'
    ].join('\n')

    const result = builder.build(parser.parse(source))
    expect(result).toBe(expected)
  })

})

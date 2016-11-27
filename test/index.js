'use strict'

const compareObject = require('./utils/compare-objects')
const htmlParser = require('../')
const expect = require('expect')

process.chdir(__dirname)

describe('The Parser', function () {

  const theTests = require('./tparser')
  const titles = Object.keys(theTests)

  const _TDEBUG = 0//'whitespace in attributes is ignored #7'

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i]

    it(title, function () {
      const test  = theTests[title]
      const parse = htmlParser(test.options)
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


describe.only('Expressions', function () {

  const theTests = require('./texpr')
  const titles = Object.keys(theTests)

  const _TDEBUG = 0// 'attr: simple expression'

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i]

    it(title, function () {
      const test  = theTests[title]
      const parse = htmlParser(test.options)
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

  const htmlBuilder = require('../dist/htmlbuilder')
  const theTests = require('./thtmlbuilder')
  const titles = Object.keys(theTests)

  const _TDEBUG = 0//'Throws on closing *void* tags'

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i]

    it(title, function () {
      const test  = theTests[title]
      const parse = htmlParser(test.options, htmlBuilder)

      if (_TDEBUG && title === _TDEBUG) debugger

      if (test.throws) {
        expect(function () {
          parse(test.data)
        }).toThrow(test.throws)

      } else {
        parse(test.data, function (err, result) {
          if (err) throw err

          expect(result).toBe(test.expected)
        })
      }
    })

    if (_TDEBUG && title === _TDEBUG) break
  }

})

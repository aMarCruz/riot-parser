'use strict'

const theTests = require('./tparser')
const htmlParser = require('../')

const titles = Object.keys(theTests)

for (let i = 0; i < titles.length; i++) {
  const title = titles[i]
  const test  = theTests[title]
  const parse = htmlParser(test.options).parse

  console.log(title)
  if (test.throws) {
    try {
      parse(test.data)
    } catch (e) {
      console.error(e.message)
    }
  } else {
    const result = parse(test.data)
    console.log(JSON.stringify(result.output, null, '  '))
  }
}

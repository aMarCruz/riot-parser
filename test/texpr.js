
const fn = require('../')
const _T = fn().nodeTypes

module.exports = {

  'text: simple expression': {
    data: 'foo & { 0 }',
    expected: [
      { type: _T.TEXT, start: 0, end: 11, expr: [{ start: 6, end: 11 }] }
    ]
  },

  'attr: simple expression': {
    data: '<a foo="{e}"/>',
    expected: [
      {
        type: _T.TAG, name: 'a', start: 0, end: 14, selfclose: true, attrs: [
          { name: 'foo', value: '{e}', start: 3, end: 12, expr: [
            { start: 8, end: 11 }
          ] }
        ]
      }
    ]
  },

  'attr: single quoted expr inside double quoted value': {
    data: '<a foo="{\'e\'}"/>',
    expected: [
      {
        type: _T.TAG, name: 'a', start: 0, end: 16, selfclose: true, attrs: [
          { name: 'foo', value: "{'e'}", start: 3, end: 14, expr: [
            { start: 8, end: 13 }
          ] }
        ]
      }
    ]
  },

  'text expression inside tag': {
    data: '<div>foo & { 0 }</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 16, expr: [{ start: 11, end: 16 }] },
      { type: _T.TAG, name: '/div', start: 16, end: 22 }
    ]
  },

  'ES6 expression inside tag': {
    data: '<div>foo & { `bar${baz}` }</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 26, expr: [{ start: 11, end: 26 }] },
      { type: _T.TAG, name: '/div', start: 26, end: 32 }
    ]
  },

  'ES6 with ES6 inside': {
    data: '<div>foo & { `bar${`}`}` }</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 26, expr: [{ start: 11, end: 26 }] },
      { type: _T.TAG, name: '/div', start: 26, end: 32 }
    ]
  },

  'ES6 with ES6 inside (2)': {
    data: '<div>foo & { `bar${ "a" + `b${a + "}"}` }` }</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 44, expr: [{ start: 11, end: 44 }] },
      { type: _T.TAG, name: '/div', start: 44, end: 50 }
    ]
  },

  'Simple string with embeded brackets': {
    data: '<div>foo & { "{" }</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 18, expr: [{ start: 11, end: 18 }] },
      { type: _T.TAG, name: '/div', start: 18, end: 24 }
    ]
  },

  'Complex string with embeded brackets': {
    data: "<div>foo & { s === \"{\" ? '' : '{' }</div>",
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 35, expr: [{ start: 11, end: 35 }] },
      { type: _T.TAG, name: '/div', start: 35, end: 41 }
    ]
  },

  'Shortcuts in attributes': {
    data: '<div foo= "{ s: "}", c: \'{\', d: /}/ }"/>',
    expected: [
      {
        type: _T.TAG, name: 'div', start: 0, end: 40, selfclose: true, attrs: [
          { name: 'foo', value: '{ s: "}", c: \'{\', d: /}/ }', start: 5, end: 38, expr: [
            { start: 11, end: 37 }
          ] }
        ]
      }
    ]
  },

}

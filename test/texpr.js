
const fn = require('../')
const _T = fn().nodeTypes

module.exports = {

  'must preserve spaces around': {
    data: '{ 0 }',
    expected: [
      {
        type: _T.TEXT, start: 0, end: 5, expr: [
          { text: ' 0 ', start: 0, end: 5 }
        ]
      }
    ]
  },

  'must preserve spaces around #2': {
    data: 'foo {\n\t0\n}',
    expected: [
      {
        type: _T.TEXT, start: 0, end: 10, expr: [
          { text: '\n\t0\n', start: 4, end: 10 }
        ]
      }
    ]
  },

  'must preserve spaces around #3': {
    data: 'foo {\n0\n+\n1 }',
    expected: [
      {
        type: _T.TEXT, start: 0, end: 13, expr: [
          { text: '\n0\n+\n1 ', start: 4, end: 13 }
        ]
      }
    ]
  },

  'must handle double quotes inside unquoted expression': {
    data: 'foo {"<a>"}',
    expected: [
      {
        type: _T.TEXT, start: 0, end: 11, expr: [
          { text: '"<a>"', start: 4, end: 11 }
        ]
      }
    ]
  },

  'must handle double quotes inside double quoted expression': {
    data: 'foo "{"<a>"}"',
    expected: [
      {
        type: _T.TEXT, start: 0, end: 13, expr: [
          { text: '"<a>"', start: 5, end: 12 }
        ]
      }
    ]
  },

  'must handle single quotes inside single quoted expression': {
    data: "foo '{'<a>'}'",
    expected: [
      {
        type: _T.TEXT, start: 0, end: 13, expr: [
          { text: "'<a>'", start: 5, end: 12 }
        ]
      }
    ]
  },

  'text inside tag, simple expression': {
    data: '<div>foo & { 0 }</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 16, expr: [
          { text: ' 0 ', start: 11, end: 16 }
      ] },
      { type: _T.TAG, name: '/div', start: 16, end: 22 }
    ]
  },

  'text inside tag, expression with embeded brackets': {
    data: '<div>foo & { "{" }</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 18, expr: [
        { text: ' "{" ', start: 11, end: 18 }
      ] },
      { type: _T.TAG, name: '/div', start: 18, end: 24 }
    ]
  },

  'text inside tag, ternary with embeded brackets': {
    data: "<div>foo & { s === \"{\" ? '' : '}' }</div>",
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 35, expr: [
        { text: " s === \"{\" ? '' : '}' ", start: 11, end: 35 }
      ] },
      { type: _T.TAG, name: '/div', start: 35, end: 41 }
    ]
  },

  'text inside tag, literal regex in expression': {
    data: '<a>{ s: /}/ }</a>',
    expected: [
      { type: _T.TAG, name: 'a', start: 0, end: 3 },
      { type: _T.TEXT, start: 3, end: 13, expr: [
        { text: ' s: /}/ ', start: 3, end: 13 }
      ] },
      { type: _T.TAG, name: '/a', start: 13, end: 17 }
    ]
  },

  'text inside tag, like-regex sequence in expression': {
    data: '<a>{ a++ /5}{0/ -1 }</a>',
    expected: [
      { type: _T.TAG, name: 'a', start: 0, end: 3 },
      { type: _T.TEXT, start: 3, end: 20, expr: [
        { text: ' a++ /5', start: 3, end: 12 },
        { text: '0/ -1 ', start: 12, end: 20 }
      ] },
      { type: _T.TAG, name: '/a', start: 20, end: 24 }
    ]
  },

  'text inside tag, tricky regex': {
    data: '<a>{ a-++/}/i.lastIndex }</a>',
    expected: [
      { type: _T.TAG, name: 'a', start: 0, end: 3 },
      { type: _T.TEXT, start: 3, end: 25, expr: [
        { text: ' a-++/}/i.lastIndex ', start: 3, end: 25 }
      ] },
      { type: _T.TAG, name: '/a', start: 25, end: 29 }
    ]
  },

  'text inside tag, regex with tags inside': {
    data: '<a> { a + /<g></g> b } </a>',
    expected: [
      { type: _T.TAG, name: 'a', start: 0, end: 3 },
      { type: _T.TEXT, start: 3, end: 23, expr: [
        { text: ' a + /<g></g> b ', start: 4, end: 22 }
      ] },
      { type: _T.TAG, name: '/a', start: 23, end: 27 }
    ]
  },

  'text inside tag, shortcut': {
    data: '<a>{ a: 1, "b": fn(a,b) }</a>',
    expected: [
      { type: _T.TAG, name: 'a', start: 0, end: 3 },
      { type: _T.TEXT, start: 3, end: 25, expr: [
        { text: ' a: 1, "b": fn(a,b) ', start: 3, end: 25 }
      ] },
      { type: _T.TAG, name: '/a', start: 25, end: 29 }
    ]
  },

  'attr: simple expression': {
    data: '<a foo="{e}"/>',
    expected: [
      {
        type: _T.TAG, name: 'a', start: 0, end: 14, selfclose: true, attrs: [
          { name: 'foo', value: '{e}', start: 3, end: 12, valueStart: 8, expr: [
            { text: 'e', start: 8, end: 11 }
          ] }
        ]
      }
    ]
  },

  'attr: expression in unquoted value, spaces inside expression': {
    data: '<a foo={ e }/>',
    expected: [
      {
        type: _T.TAG, name: 'a', start: 0, end: 14, selfclose: true, attrs: [
          { name: 'foo', value: '{ e }', start: 3, end: 12, valueStart: 7, expr: [
            { text: ' e ', start: 7, end: 12 }
          ] }
        ]
      }
    ]
  },

  'Shortcuts in attributes': {
    data: '<div foo= "{ s: "}", c: \'{\', d: /}/ }"/>',
    expected: [
      {
        type: _T.TAG, name: 'div', start: 0, end: 40, selfclose: true, attrs: [
          { name: 'foo', value: '{ s: "}", c: \'{\', d: /}/ }', start: 5, end: 38, valueStart: 11, expr: [
            { text: ' s: "}", c: \'{\', d: /}/ ', start: 11, end: 37 }
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
          { name: 'foo', value: "{'e'}", start: 3, end: 14, valueStart: 8, expr: [
            { text: "'e'", start: 8, end: 13 }
          ] }
        ]
      }
    ]
  },

  'attr: single quoted expr inside single quoted value': {
    data: "<a foo='{'e'}'/>",
    expected: [
      {
        type: _T.TAG, name: 'a', start: 0, end: 16, selfclose: true, attrs: [
          { name: 'foo', value: "{'e'}", start: 3, end: 14, valueStart: 8, expr: [
            { text: "'e'", start: 8, end: 13 }
          ] }
        ]
      }
    ]
  },

  'attr: double quoted expr inside single quoted value': {
    data: '<a foo=\'{"e"}\'/>',
    expected: [
      {
        type: _T.TAG, name: 'a', start: 0, end: 16, selfclose: true, attrs: [
          { name: 'foo', value: '{"e"}', start: 3, end: 14, valueStart: 8, expr: [
            { text: '"e"', start: 8, end: 13 }
          ] }
        ]
      }
    ]
  },

  'attr: double quoted expr inside double quoted value': {
    data: '<a foo="{"e"}"/>',
    expected: [
      {
        type: _T.TAG, name: 'a', start: 0, end: 16, selfclose: true, attrs: [
          { name: 'foo', value: '{"e"}', start: 3, end: 14, valueStart: 8, expr: [
            { text: '"e"', start: 8, end: 13 }
          ] }
        ]
      }
    ]
  },

  'ES6 expression inside tag': {
    data: '<div>foo & { `bar${baz}` }</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 26, expr: [
        { text: ' `bar${baz}` ', start: 11, end: 26 }
      ] },
      { type: _T.TAG, name: '/div', start: 26, end: 32 }
    ]
  },

  'ES6 with ES6 backquote inside': {
    data: '<div>foo & { `bar${`}`}` }</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 26, expr: [
        { text: ' `bar${`}`}` ', start: 11, end: 26 }
      ] },
      { type: _T.TAG, name: '/div', start: 26, end: 32 }
    ]
  },

  'ES6 with ternary inside': {
    data: '<div>foo & { `bar${ a?"<a>":\'}\' }` }</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 36, expr: [
        { text: ' `bar${ a?"<a>":\'}\' }` ', start: 11, end: 36 }
      ] },
      { type: _T.TAG, name: '/div', start: 36, end: 42 }
    ]
  },

  'Expression inside tag with multiline ES6': {
    data: '<div>foo & { `\nbar${\n\t`}`}\n` }</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 30, expr: [
        { text: ' `\nbar${\n\t`}`}\n` ', start: 11, end: 30 }
      ] },
      { type: _T.TAG, name: '/div', start: 30, end: 36 }
    ]
  },

  'Expression inside tag with multiline ES6 #2': {
    data: '<div>foo & {\n`\nbar\n${\t`}`}`\n }</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 30, expr: [
        { text: '\n`\nbar\n${\t`}`}`\n ', start: 11, end: 30 }
      ] },
      { type: _T.TAG, name: '/div', start: 30, end: 36 }
    ]
  },

  'ES6 with ES6 backquote inside #2': {
    data: '<div>foo & { `bar${``}` }</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 25, expr: [
        { text: ' `bar${``}` ', start: 11, end: 25 }
      ] },
      { type: _T.TAG, name: '/div', start: 25, end: 31 }
    ]
  },

  'ES6 with double quotes inside': {
    data: '<div>foo & "{ `bar${ "a" + `b${""}` }` }"</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 41, expr: [
        { text: ' `bar${ "a" + `b${""}` }` ', start: 12, end: 40 }
      ] },
      { type: _T.TAG, name: '/div', start: 41, end: 47 }
    ]
  },

  'ES6 with double quotes inside #2': {
    data: '<div>foo & "{ `"bar${ "a" + `b${""}` }"` }"</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 43, expr: [
        { text: ' `"bar${ "a" + `b${""}` }"` ', start: 12, end: 42 }
      ] },
      { type: _T.TAG, name: '/div', start: 43, end: 49 }
    ]
  },

  'ES6 with ES6 backquote and closing bracket inside': {
    data: '<div>foo & { `bar${ "a" + `b${a + "}"}` }` }</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 44, expr: [
        { text: ' `bar${ "a" + `b${a + "}"}` }` ', start: 11, end: 44 }
      ] },
      { type: _T.TAG, name: '/div', start: 44, end: 50 }
    ]
  },

}

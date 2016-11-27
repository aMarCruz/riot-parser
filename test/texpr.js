const _T = require('./types')

module.exports = {

  'attr: simple expression': {
    data: '<a foo="{e}"/>',
    expected: [
      {
        type: _T.TAG, name: 'a', end: 14, selfclose: true, attrs: [
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
          { name: 'foo', value: '{\'e\'}', start: 3, end: 14, expr: [
            { start: 8, end: 13 }
          ] }
        ]
      }
    ]
  },

  'text: simple expression': {
    data: 'foo & { 0 }',
    expected: [
      { type: _T.TEXT, start: 0, end: 11, expr: [{ start: 6, end: 11 }] }
    ]
  },
}

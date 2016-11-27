
const _T = require('./types')

module.exports = {

  'plain text': {
    data: 'This is the text',
    expected: [{ type: _T.TEXT, start: 0, end: 16 }]
  },

  'simple tag': {
    data: '<div>',
    expected: [{ type: _T.TAG, name: 'div', start: 0, end: 5 }]
  },

  'text before tag': {
    data: 'xxx<div>',
    expected: [
      { type: _T.TEXT, start: 0, end: 3 },
      { type: _T.TAG, name: 'div', start: 3, end: 8 }
    ]
  },

  'text after tag': {
    data: '<div>xxx',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 8 }
    ]
  },

  'text inside tag': {
    data: '<div>xxx</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TEXT, start: 5, end: 8 },
      { type: _T.TAG, name: '/div', start: 8, end: 14 }
    ]
  },

  'attribute with single quotes': {
    data: '<div a=\'1\'>',
    expected: [
      {
        type: _T.TAG, name: 'div', start: 0, end: 11, attrs: [
          { name: 'a', value: '1', start: 5, end: 10 }
        ]
      },
    ]
  },

  'attribute with double quotes': {
    data: '<div a="1">',
    expected: [
      {
        type: _T.TAG, name: 'div', start: 0, end: 11, attrs: [
          { name: 'a', value: '1', start: 5, end: 10 }
        ]
      }
    ]
  },

  'attribute with no quotes': {
    data: '<div  a=1>',
    expected: [
      {
        type: _T.TAG, name: 'div', start: 0, end: 10, attrs: [
          { name: 'a', value: '1', start: 6, end: 9 }
        ]
      }
    ]
  },

  'attribute with no value': {
    data: '<div wierd>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 11, attrs: [
        { name: 'wierd', value: '', start: 5, end: 10 }
      ] }
    ]
  },

  'attribute with no value, trailing text': {
    data: '<div wierd>xxx',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 11, attrs: [
          { name: 'wierd', value: '', start: 5, end: 10 }
      ] },
      { type: _T.TEXT, start: 11, end: 14 }
    ]
  },

  'tag with multiple attributes': {
    data: '<div a="1" b="2">',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 17, attrs: [
        { name: 'a', value: '1', start: 5, end: 10 },
        { name: 'b', value: '2', start: 11, end: 16 }
      ] },
    ]
  },

  'tag with multiple attributes, trailing text': {
    data: '<div a="1" b="2">xxx',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 17, attrs: [
        { name: 'a', value: '1', start: 5, end: 10 },
        { name: 'b', value: '2', start: 11, end: 16 }
      ] },
      { type: _T.TEXT, start: 17, end: 20 }
    ]
  },

  'tag with mixed attributes #1': {
    data: '<div a=1 b=\'2\' c="3">',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 21, attrs: [
        { name: 'a', value: '1', start: 5, end: 8 },
        { name: 'b', value: '2', start: 9, end: 14 },
        { name: 'c', value: '3', start: 15, end: 20 }
      ] }
    ]
  },

  'tag with mixed attributes #2': {
    data: '<div a=1 b="2" c=\'3\'>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 21, attrs: [
        { name: 'a', value: '1', start: 5, end: 8 },
        { name: 'b', value: '2', start: 9, end: 14 },
        { name: 'c', value: '3', start: 15, end: 20 }
      ] }
    ]
  },

  'tag with mixed attributes #3': {
    data: '<div a=\'1\' b=2 c="3">',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 21, attrs: [
        { name: 'a', value: '1', start: 5, end: 10 },
        { name: 'b', value: '2', start: 11, end: 14 },
        { name: 'c', value: '3', start: 15, end: 20 }
      ] }
    ]
  },

  'tag with mixed attributes #4': {
    data: '<div a=\'1\' b="2" c=3>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 21, attrs: [
        { name: 'a', value: '1', start: 5, end: 10  },
        { name: 'b', value: '2', start: 11, end: 16 },
        { name: 'c', value: '3', start: 17, end: 20 }
      ] }
    ]
  },

  'tag with mixed attributes #5': {
    data: '<div a="1" b=2 c=\'3\'>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 21, attrs: [
        { name: 'a', value: '1', start: 5, end: 10 },
        { name: 'b', value: '2', start: 11, end: 14 },
        { name: 'c', value: '3', start: 15, end: 20 }
      ] }
    ]
  },

  'tag with mixed attributes #6': {
    data: '<div a="1" b=\'2\' c="3">',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 23, attrs: [
        { name: 'a', value: '1', start: 5, end: 10 },
        { name: 'b', value: '2', start: 11, end: 16 },
        { name: 'c', value: '3', start: 17, end: 22 }
      ] }
    ]
  },

  'tag with mixed attributes, trailing text': {
    data: '<div a=1 b=\'2\' c="3">xxx',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 21, attrs: [
        { name: 'a', value: '1', start: 5, end: 8 },
        { name: 'b', value: '2', start: 9, end: 14 },
        { name: 'c', value: '3', start: 15, end: 20 }
      ] },
      { type: _T.TEXT, start: 21, end: 24 }
    ]
  },

  'multiline attribute #1': {
    data: "<div id='\nxxx\nyyy\n'>",
    expected: [
      { type: _T.TAG,  name: 'div', attrs: [
        { name: 'id', value: '\nxxx\nyyy\n', end: 19 }
      ] }
    ]
  },

  'multiline attribute #2': {
    data: '<div id="\nxxx\nyyy\n">',
    expected: [
      { type: _T.TAG,  name: 'div', attrs: [
        { name: 'id', value: '\nxxx\nyyy\n', end: 19 }
      ] }
    ]
  },

  'self closing tag': {
    data: '<div/>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 6, selfclose: true }
    ]
  },

  'self closing tag, trailing text': {
    data: '<div/>xxx',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 6, selfclose: true },
      { type: _T.TEXT, start: 6, end: 9 }
    ]
  },

  'self closing tag with spaces #1': {
    data: '<div />',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 7, selfclose: true }
    ]
  },

  'self closing tag with spaces #2': {
    data: '<div/ >',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 7, selfclose: true }
    ]
  },

  'self closing tag with spaces #3': {
    data: '<div\n / >',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 9, selfclose: true }
    ]
  },

  'self closing tag with spaces, trailing text': {
    data: '<div / >xxx',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 8, selfclose: true },
      { type: _T.TEXT, start: 8, end: 11 }
    ]
  },

  'self closing tag with attribute': {
    data: '<div a=b/>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 10, selfclose: true, attrs: [
        { name: 'a', value: 'b', start: 5, end: 8 }
      ] }
    ]
  },

  'self closing tag space after attribute value': {
    data: '<div a=b />',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 11, selfclose: true, attrs: [
        { name: 'a', value: 'b', start: 5, end: 8 }
      ] }
    ]
  },

  'self closing tag with quoted attribute': {
    data: '<div a="b"/>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 12, selfclose: true, attrs: [
        { name: 'a', value: 'b', start: 5, end: 10 }
      ] }
    ]
  },

  'self closing tag with new line after quoted attribute value': {
    data: '<div a=\'b\'\n/>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 13, selfclose: true, attrs: [
        { name: 'a', value: 'b', start: 5, end: 10 }
      ] }
    ]
  },

  'self closing tag with attribute, trailing text': {
    data: '<div a=b />xxx',
    expected: [
      { type: _T.TAG,  name: 'div', start: 0, end: 11, selfclose: true, attrs: [
        { name: 'a', value: 'b', start: 5, end: 8 }
      ] },
      { type: _T.TEXT, start: 11, end: 14 }
    ]
  },

  'self closing tag with attribute, trailing tag': {
    data: '<div a=b /></div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 11, selfclose: true, attrs: [
        { name: 'a', value: 'b', start: 5, end: 8 }
      ] },
      { type: _T.TAG, name: '/div', start: 11, end: 17 }
    ]
  },

  'attribute missing close quote': {
    data: '<div a="1><span id="foo">xxx',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 25, attrs: [
        { name: 'a', value: '1><span id=', start: 5, end: 20 },
        { name: 'foo"', value: '', start: 20, end: 24 }
      ] },
      { type: _T.TEXT, start: 25, end: 28 }
    ]
  },
/*
  'option `location` gives line/col info in the `loc` property': {
    options: { location: true },
    data: '<div a=b>\n</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 9, loc: { line: 1, col: 0 }, attrs: [
        { name: 'a', value: 'b', start: 5, end: 8 }
      ] },
      { type: _T.TEXT, start: 9, end: 10, loc: { line: 1, col: 9 } },
      { type: _T.TAG, name: '/div', start: 10, end: 16, loc: { line: 2, col: 0 } }
    ]
  },*/

  'text before complex tag': {
    data: 'xxx<div yyy="123">',
    expected: [
      { type: _T.TEXT, start: 0, end: 3 },
      { type: _T.TAG, name: 'div', start: 3, end: 18, attrs: [
        { name: 'yyy', value: '123', start: 8, end: 17 }
      ] }
    ]
  },

  'text after complex tag': {
    data: '<div yyy="123">xxx',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 15, attrs: [
        { name: 'yyy', value: '123', start: 5, end: 14 }
      ] },
      { type: _T.TEXT, start: 15, end: 18 }
    ]
  },

  'text inside complex tag': {
    options: { location: true },
    data: '<div yyy="123">xxx</div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 15, attrs: [
        { name: 'yyy', value: '123', start: 5, end: 14 }
      ] },
      { type: _T.TEXT, start: 15, end: 18 },
      { type: _T.TAG, name: '/div', start: 18, end: 24 }
    ]
  },

  'nested tags': {
    data: '<div><span></span></div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.TAG, name: 'span', start: 5, end: 11 },
      { type: _T.TAG, name: '/span', start: 11, end: 18 },
      { type: _T.TAG, name: '/div', start: 18, end: 24 }
    ]
  },

  'nested tags with attributes': {
    data: '<div aaa="bbb"><span 123=\'456\'>xxx</span></div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 15, attrs: [
        { name: 'aaa', value: 'bbb', start: 5, end: 14 }
      ] },
      { type: _T.TAG, name: 'span', start: 15, end: 31, attrs: [
        { name: '123', value: '456', start: 21, end: 30 }
      ] },
      { type: _T.TEXT, start: 31, end: 34 },
      { type: _T.TAG, name: '/span', start: 34, end: 41 },
      { type: _T.TAG, name: '/div', start: 41, end: 47 }
    ]
  },

  'comment inside tag': {
    options: { comments: true },
    data: '<div><!-- comment text --></div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.COMMENT, start: 5, end: 26 },
      { type: _T.TAG, name: '/div', start: 26, end: 32 }
    ]
  },

  'in html, unhidden CDATA sections are parsed as comments enclosed by `<!>`': {
    options: { comments: true },
    data: '<div><![CDATA[ CData content ]]></div>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 5 },
      { type: _T.COMMENT, start: 5, end: 32 },
      { type: _T.TAG, name: '/div', start: 32, end: 38 }
    ]
  },

  'in html, unhidden CDATA is parsed as comment (<! >) so `>` breaks the tag': {
    options: { comments: true },
    data: '<![CDATA[ <div>\n  foo\n</div> ]]>',
    expected: [
      { type: _T.COMMENT, start: 0, end: 15 },
      { type: _T.TEXT, start: 15, end: 22 },
      { type: _T.TAG, name: '/div', start: 22, end: 28 },
      { type: _T.TEXT, start: 28, end: 32 }
    ]
  },

  'hidden CDATA (inside comments) becomes simple text': {
    options: { comments: true },
    data: '<!-- <![CDATA[ content ]]> -->',
    expected: [{ type: _T.COMMENT, start: 0, end: 30 }]
  },

  'html inside comment': {
    options: { comments: true },
    data: '<!-- <div>foo</div> -->',
    expected: [{ type: _T.COMMENT, start: 0, end: 23 }]
  },

  'html5 doctype (lowercase)': {
    data: '<!doctype html>\n<html></html>',
    expected: [
      { type: _T.DOCTYPE, start: 0, end: 15 },
      { type: _T.TEXT, start: 15, end: 16 },
      { type: _T.TAG, name: 'html', start: 16, end: 22 },
      { type: _T.TAG, name: '/html', start: 22, end: 29 }
    ]
  },

  'transitional doctype': {
    data: '\n<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html></html>',
    expected: [
      { type: _T.TEXT, start: 0, end: 1 },
      { type: _T.DOCTYPE, start: 1, end: 103 },
      { type: _T.TAG, name: 'html', start: 103, end: 109 },
      { type: _T.TAG, name: '/html', start: 109, end: 116 }
    ]
  },

  'quotes in attribute #1': {
    data: '<div xxx=\'a"b\'>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 15, attrs: [
        { name: 'xxx', value: 'a"b', start: 5, end: 14 }
      ] }
    ]
  },

  'quotes in attribute #2': {
    data: '<div xxx="a\'b"\n>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 16, attrs: [
        { name: 'xxx', value: 'a\'b', start: 5, end: 14 }
      ] }
    ]
  },

  'brackets in attribute': {
    data: '<div xxx="</div>">\n',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 18, attrs: [
        { name: 'xxx', value: '</div>', start: 5, end: 17 }
      ] },
      { type: _T.TEXT, start: 18, end: 19 }
    ]
  },

  'unfinished simple tag #1': {
    data: '<div',
    throws: /unexpected/
  },

  'unfinished simple tag #2': {
    data: '<div ',
    throws: /unexpected/
  },

  'unfinished complex tag #1': {
    data: '<div foo="bar"',
    throws: /unexpected/
  },

  'unfinished complex tag #2': {
    data: '<div  foo="bar" ',
    throws: /unexpected/
  },

  'unfinished comment #1': {
    data: '<!-- comment text',
    throws: /unclosed comment/
  },

  'unfinished comment #2': {
    data: '<!-- comment text --',
    throws: /unclosed comment/
  },

  'unfinished comment #3': {
    data: '<div><!-- comment text </div>',
    throws: /unclosed comment/
  },

  'unfinished comment #4 (short notation)': {
    data: '<! comment text ',
    throws: /unclosed comment/
  },

  'unfinished unhidden CDATA becomes an unclosed comment': {
    data: '<![CDATA[ content',
    throws: /unclosed comment/
  },

  // Chrome discard the whole tag
  'must throw error on unfinished attributes': {
    data: '<div foo="bar',
    throws: /unfinished attribute/
  },

  // Chrome discard the whole tag
  'must throw error on unfinished attributes #2': {
    data: '<div foo=" </div>',
    throws: /unfinished attribute/
  },

  'must throw error on unfinished attributes #3': {
    data: '<div foo="bar',
    throws: /unfinished attribute/
  },

  'whitespace after the tag name is ignored #1': {
    data: '<div\t\n\n  \n\t>',
    expected: [{ type: _T.TAG, name: 'div', end: 12 }]
  },

  'whitespace after the tag name is ignored #2': {
    data: '<div \n></div \n >',
    expected: [
      { type: _T.TAG, name: 'div', end: 7 },
      { type: _T.TAG, name: '/div', start: 7, end: 16 }
    ]
  },

  'whitespace in closing tag is ignored #1': {
    data: '</div\t\n \n\t>',
    expected: [{ type: _T.TAG, name: '/div', end: 11 }]
  },

  'whitespace in closing tag is ignored #2': {
    data: '</div\r\n  >foo',
    expected: [
      { type: _T.TAG, name: '/div', end: 10 },
      { type: _T.TEXT, start: 10, end: 13 }
    ]
  },

  'whitespace in attributes is ignored #1': {
    data: '<div foo ="bar">',
    expected: [
      { type: _T.TAG, name: 'div', end: 16, attrs: [
        { name: 'foo', value: 'bar', start: 5, end: 15 }
      ] }
    ]
  },

  'whitespace in attributes is ignored #2': {
    data: '<div foo= "bar">', expected: [
      { type: _T.TAG, name: 'div', end: 16, attrs: [
        { name: 'foo', value: 'bar', start: 5, end: 15 }
      ] }
    ]
  },

  'whitespace in attributes is ignored #3': {
    data: '<div\n foo = "bar">',
    expected: [
      { type: _T.TAG, name: 'div', end: 18, attrs: [
        { name: 'foo', value: 'bar', start: 6, end: 17 }
      ] }
    ]
  },

  'whitespace in attributes is ignored #4': {
    data: '<div foo =bar>',
    expected: [
      { type: _T.TAG, name: 'div', end: 14, attrs: [
        { name: 'foo', value: 'bar', start: 5, end: 13 }
      ] }
    ]
  },

  'whitespace in attributes is ignored #5': {
    data: '<div foo= bar>',
    expected: [
      { type: _T.TAG, name: 'div', end: 14, attrs: [
        { name: 'foo', value: 'bar', start: 5, end: 13 }
      ] }
    ]
  },

  'whitespace in attributes is ignored #6': {
    data: '<div foo = bar>',
    expected: [
      { type: _T.TAG, name: 'div', end: 15, attrs: [
        { name: 'foo', value: 'bar', start: 5, end: 14 }
      ] }
    ]
  },

  'whitespace in attributes is ignored #7': {
    data: '<div  bar\n\n>',
    expected: [
      { type: _T.TAG, name: 'div', end: 12, attrs: [
        { name: 'bar', value: '', start: 6, end: 9 }
      ] }
    ]
  },

  'attributes with empty value': {
    data: '<div foo = "">',
    expected: [
      { type: _T.TAG, name: 'div', end: 14, attrs: [
        { name: 'foo', value: '', start: 5, end: 13 }
      ] }
    ]
  },

  'attributes with empty value (w/ equal sign)': {
    data: '<div foo=>',
    expected: [
      { type: _T.TAG, name: 'div', end: 10, attrs: [
        { name: 'foo', value: '', start: 5, end: 9 }
      ] }
    ]
  },

  'mixed case tag names are lowercased': {
    data: '<diV>',
    expected: [{ type: _T.TAG, name: 'div' }]
  },

  'upper case tag names are lowercased': {
    data: '<DIV>',
    expected: [{ type: _T.TAG, name: 'div' }]
  },

  'mixed case attribute are lowercased': {
    data: '<div xXx="Yyy">',
    expected: [
      { type: _T.TAG, name: 'div', attrs: [
        { name: 'xxx', value: 'Yyy', start: 5, end: 14 }
      ] }
    ]
  },

  'upper case case attribute are lowercased': {
    data: '<div XXX="Yyy">',
    expected: [
      { type: _T.TAG, name: 'div', attrs: [
        { name: 'xxx', value: 'Yyy', start: 5, end: 14 }
      ] }
    ]
  },

  'multiline complex tag': {
    data: "<div\n  id='foo'\n></div\n \n\t>",
    expected: [
      { type: _T.TAG, name: 'div', end: 17, attrs: [
        { name: 'id', value: 'foo', start: 7, end: 15 }
      ] },
      { type: _T.TAG, name: '/div', start: 17, end: 27 }
    ]
  },

  'must keep multiline comment': {
    data: '<!--\ncomment text\n-->',
    expected: [{ type: _T.COMMENT, start: 0, end: 21 }]
  },

  'must keep multiline comment with nested comment (start)': {
    data: '<!--\ncomment text\n<!-- -->',
    expected: [{ type: _T.COMMENT, start: 0, end: 26 }]
  },

  'must keep comment with nested comment (close)': {
    data: '<!-- comment text <!--> -->',
    expected: [
      { type: _T.COMMENT, start: 0, end: 23 },
      { type: _T.TEXT, start: 23, end: 27 }
    ]
  },

  'must keep comment with only dashes': {
    data: '<!------->\n',
    expected: [
      { type: _T.COMMENT, start: 0, end: 10 },
      { type: _T.TEXT, start: 10, end: 11 }
    ]
  },

  'must keep comment with only dashes #2': {
    options: { comments: true },
    data: '<!-- ----->\n',
    expected: [
      { type: _T.COMMENT, start: 0, end: 11 },
      { type: _T.TEXT, start: 11, end: 12 }
    ]
  },

  'comment short notation in one line': {
    data: '<! foo >',
    expected: [{ type: _T.COMMENT, start: 0, end: 8 }]
  },

  'comment short notation with 2 dashes': {
    data: '\n<!-->',
    expected: [
      { type: _T.TEXT, start: 0, end: 1 },
      { type: _T.COMMENT, start: 1, end: 6 }
    ]
  },

  'comment short notation multiline': {
    data: '<!\n  foo\n>\n',
    expected: [
      { type: _T.COMMENT, start: 0, end: 10 },
      { type: _T.TEXT, start: 10, end: 11 }
    ]
  },

  'comment short notation starting with "-"': {
    data: '<!-foo >',
    expected: [{ type: _T.COMMENT, start: 0, end: 8 }]
  },

  'comment short notation ending with "--"': {
    data: '<!foo -->',
    expected: [{ type: _T.COMMENT, start: 0, end: 9 }]
  },

  'comment short notation with dashes inside': {
    data: '<! -- -->',
    expected: [{ type: _T.COMMENT, start: 0, end: 9 }]
  },

  'tags in script tag code': {
    data: "<script language='javascript'>\nvar foo = '<bar>xxx</bar>';\n</script>",
    expected: [
      { type: _T.TAG,  name: 'script', start: 0, end: 30, attrs: [
        { name: 'language', value: 'javascript', start: 8, end: 29 }
      ] },
      { type: _T.TEXT, start: 30, end: 59 },
      { type: _T.TAG,  name: '/script', start: 59, end: 68 }
    ]
  },

  'closing script tag in script tag code': {
    data: "<script language='javascript'>\nvar foo = '</script>';\n</script>",
    expected: [
      { type: _T.TAG,  name: 'script', attrs: [
        { name: 'language', value: 'javascript' }
      ] },
      { type: _T.TEXT, start: 30, end: 42 },
      { type: _T.TAG,  name: '/script', start: 42, end: 51 },
      { type: _T.TEXT, start: 51, end: 54 },
      { type: _T.TAG,  name: '/script', start: 54, end: 63 }
    ]
  },

  'non-closing script tag <\\/script> in script tag code': {
    data: "<script language='javascript'>\nvar foo = '<\\/script>';\n</script>",
    expected: [
      { type: _T.TAG,  name: 'script', attrs: [
        { name: 'language', value: 'javascript' }
      ] },
      { type: _T.TEXT, start: 30, end: 55 },
      { type: _T.TAG,  name: '/script', start: 55, end: 64 }
    ]
  },

  'comments in script tag code are preserved': {
    data: "<script language='javascript'>\nvar foo = '<!-- xxx -->';\n</script>",
    expected: [
      { type: _T.TAG,  name: 'script', attrs: [
        { name: 'language', value: 'javascript' }
      ] },
      { type: _T.TEXT, start: 30, end: 57 },
      { type: _T.TAG,  name: '/script', start: 57, end: 66 },
    ]
  },

  'CDATA sections in script tag code are preserved': {
    data: "<script language='javascript'>\nvar foo = '<![CDATA[ xxx ]]>';\n</script>",
    expected: [
      { type: _T.TAG,  name: 'script', attrs: [
        { name: 'language', value: 'javascript' }
      ] },
      { type: _T.TEXT, start: 30, end: 62 },
      { type: _T.TAG,  name: '/script', start: 62, end: 71 },
    ]
  },

  'multiline CDATA inside script': {
    data: '<script>\t<![CDATA[\nCData content\n]]>\n</script>',
    expected: [
      { type: _T.TAG, name: 'script', start: 0, end: 8 },
      { type: _T.TEXT, start: 8, end: 37 },
      { type: _T.TAG, name: '/script', start: 37, end: 46 }
    ]
  },

  'commented script tag code': {
    data: "<script language='javascript'>\n<!--\nvar foo = '<bar>xxx</bar>';\n//-->\n</script>",
    expected: [
      { type: _T.TAG, name: 'script', attrs: [
        { name: 'language', value: 'javascript' }
      ] },
      { type: _T.TEXT, start: 30, end: 70 },
      { type: _T.TAG, name: '/script', start: 70, end: 79 },
    ]
  },

  'cdata in script tag': {
    data: "<script language='javascript'>\n<![CDATA[\nvar foo = '<bar>xxx</bar>';\n]]>\n</script>",
    expected: [
      { type: _T.TAG, name: 'script', attrs: [
        { name: 'language', value: 'javascript', start: 8 }
      ] },
      { type: _T.TEXT, start: 30 },
      { type: _T.TAG, name: '/script', start: 73 },
    ]
  },

  "character '<' inside text": {
    data: '<div>text < text</div>',
    expected: [
      { type: _T.TAG, name: 'div' },
      { type: _T.TEXT, start: 5 },
      { type: _T.TAG, name: '/div', start: 16 }
    ]
  },

  "character '<' inside text #2": {
    data: '<<div><<div><< </div><</div>',
    expected: [
      { type: _T.TEXT, start: 0, end: 1 },
      { type: _T.TAG, name: 'div', start: 1, end: 6 },
      { type: _T.TEXT, start: 6, end: 7 },
      { type: _T.TAG, name: 'div', start: 7, end: 12 },
      { type: _T.TEXT, start: 12, end: 15 },
      { type: _T.TAG, name: '/div', start: 15, end: 21 },
      { type: _T.TEXT, start: 21, end: 22 },
      { type: _T.TAG, name: '/div', start: 22, end: 28 }
    ]
  },

  "character '<' and '>' before tag": {
    data: '<<div></div><<><div>>',
    expected: [
      { type: _T.TEXT, start: 0, end: 1 },
      { type: _T.TAG, name: 'div', start: 1, end: 6 },
      { type: _T.TAG, name: '/div', start: 6, end: 12 },
      { type: _T.TEXT, start: 12, end: 15 },
      { type: _T.TAG, name: 'div', start: 15, end: 20 },
      { type: _T.TEXT, start: 20, end: 21 }
    ]
  },

  "sequence '<!DOCTYPE ' inside text": {
    data: '<div>text <!DOCTYPE html></div>',
    expected: [
      { type: _T.TAG, name: 'div' },
      { type: _T.TEXT, start: 5, end: 10 },
      { type: _T.COMMENT, start: 10, end: 25 },
      { type: _T.TAG, name: '/div', start: 25, end: 31 }
    ]
  },

  'attributes with tag closing inside quotes': {
    data: '<div some=" >4</div>"\n<hr>',
    expected: [
      { type: _T.TAG, name: 'div', start: 0, end: 26, attrs: [
        { name: 'some', value: ' >4</div>', start: 5, end: 21 },
        { name: '<hr', value: '', start: 22, end: 25 }
      ] }
    ]
  },

  'attributes with quotes in wrong position': {
    data: '<div some=">"5</div>',
    expected: [
      { type: _T.TAG,  name: 'div', end: 20, attrs: [
        { name: 'some', value: '>', start: 5 },
        { name: '5<',   value: '', start: 13 },
        { name: 'div',  value: '', start: 16 }
      ] }
    ]
  },

  'attributes with `<` in unquoted value': {
    data: '<div some=<</div>',
    expected: [
      { type: _T.TAG,  name: 'div', start: 0, end: 17, attrs: [
        { name: 'some', value: '<<', start: 5, end: 12 },
        { name: 'div', value: '', start: 13, end: 16 }
      ] }
    ]
  },

  'attributes with `>` in unquoted value': {
    data: '<div some=f>oo></div>',
    expected: [
      { type: _T.TAG,  name: 'div', attrs: [
        { name: 'some', value: 'f', start: 5 }
      ] },
      { type: _T.TEXT, start: 12, end: 15 },
      { type: _T.TAG, name: '/div', start: 15 }
    ]
  },

  'attributes with `/` in unquoted value': {
    data: '<div some=a/c>',
    expected: [
      { type: _T.TAG,  name: 'div', attrs: [
        { name: 'some', value: 'a', start: 5, end: 11 },
        { name: 'c', value: '', start: 12, end: 13 }
      ] }
    ]
  },

  'attributes with multiple "/" in the name': {
    data: '<div so////me>',
    expected: [
      { type: _T.TAG,  name: 'div', attrs: [
        { name: 'so', value: '', start: 5 },
        { name: 'me', value: '', start: 11 }
      ] }
    ]
  },

  'attributes with multiple "/" in the name #2': {
    data: '<div/ so/ // /me>',
    expected: [
      { type: _T.TAG,  name: 'div', attrs: [
        { name: 'so', value: '', start: 6 },
        { name: 'me', value: '', start: 14 }
      ] }
    ]
  },

  'attributes with "/" in the value': {
    data: '<div/ some="/">',
    expected: [
      { type: _T.TAG,  name: 'div', attrs: [
        { name: 'some', value: '/', start: 6 }
      ] }
    ]
  },

  'tags with unfinish comment in attribute': {
    data: '<div some="<!-- foo -->">',
    expected: [
      { type: _T.TAG,  name: 'div', end: 25, attrs: [
        { name: 'some', value: '<!-- foo -->', start: 5 }
      ] }
    ]
  },

  'windows line-endings': {
    data: '<div\r\n  foo\r\n>\r\n\r\n</div>\r\n',
    expected: [
      { type: _T.TAG,  name: 'div', attrs: [
        { name: 'foo', value: '', start: 8 }
      ] },
      { type: _T.TEXT, start: 14 },
      { type: _T.TAG,  name: '/div', start: 18 },
      { type: _T.TEXT, start: 24, end: 26 }
    ]
  },

  'mac line-endings': {
    data: '<div\r  foo\r>\r\r</div>\r',
    expected: [
      { type: _T.TAG,  name: 'div', attrs: [
        { name: 'foo', value: '', start: 7 }
      ] },
      { type: _T.TEXT, start: 12 },
      { type: _T.TAG,  name: '/div', start: 14 },
      { type: _T.TEXT, start: 20, end: 21 }
    ]
  },

  'mixed line-endings': {
    data: '\n<div\r  foo\r\n>\r\r\n\n</div>\n\n\r',
    expected: [
      { type: _T.TEXT, start: 0, end: 1 },
      { type: _T.TAG,  name: 'div', start: 1, end: 14, attrs: [
        { name: 'foo', value: '', start: 8, end: 11 }
      ] },
      { type: _T.TEXT, start: 14, end: 18 },
      { type: _T.TAG,  name: '/div', start: 18, end: 24 },
      { type: _T.TEXT, start: 24, end: 27 }
    ]
  },

  '`locations` store line/col in loc': {
    data: '<div a=1 b=\'2\' c="3">xxx',
    expected: [
      { type: _T.TAG, name: 'div', attrs: [
        { name: 'a', value: '1', start: 5, end: 8 },
        { name: 'b', value: '2', start: 9, end: 14 },
        { name: 'c', value: '3', start: 15, end: 20 }
      ] },
      { type: _T.TEXT, start: 21, end: 24 }
    ]
  }
}

/* eslint-disable max-len */

module.exports = {
  'prints valid html5 markup': {
    data: '<html><title>The Title</title><body>Hello world</body></html>',
    expected: '<html><title>The Title</title><body>Hello world</body></html>'
  },

  /*
  - Regular text:
    Whitespace normalization, incluing text in `style` sections (Optional removal of only-whitespace text).
  */
  'discards extra whitespace in text nodes': {
    options: { compact: true },
    data: '\n\n<i>\n the  <b> bold</b> text \t\n</i> \n',
    expected: ' <i> the <b> bold</b> text </i> '
  },

  'discards extra whitespace in STYLE blocks': {
    data: '<style>\n p {\n  font-weight: bold;\n}\n</style>',
    expected: '<style> p { font-weight: bold; } </style>'
  },

  'preserves whitespace within SCRIPT tags': {
    data: '<div>\n\n</div>\n<script>\n  var a=0\n  var b\n\n  return\n</script>\n<div>\n\n</div>',
    expected: '<div> </div> <script>\n  var a=0\n  var b\n\n  return\n</script> <div> </div>'
  },

  'preserves whitespace within PRE tag': {
    data: '<div>\n  Text:\n<pre>\n  Text  <span>\nok </span>\n </pre>\n\n</div>',
    expected: '<div> Text: <pre>\n  Text  <span>\nok </span>\n </pre> </div>'
  },

  'preserves whitespace inside comments': {
    options: { comments: true },
    data: '<body>\n<!--\n  this is\n  a comment\n\n -->\n</body>',
    expected: '<body> <!--\n  this is\n  a comment\n\n --> </body>'
  },

  '`compact` option replaces whitespace-only text nodes with one space': {
    options: {
      builder: { compact: true }
    },
    data: '<div>\n Line one\n<br> \t\n<br>\nline two<font> x </font>\n </div>',
    expected: '<div> Line one <br> <br> line two<font> x </font> </div>'
  },

  /*
  - Tags names:
    Removes extra whitespace and convert names to lowercase.
  */

  'Tags: Removes extra whitespace and convert names to lowercase': {
    data: '<HTML\n ><Body \n>text</Body\t \n></HTML >',
    expected: '<html><body>text</body></html>'
  },

  /*
  - Self-closing tags:
    Removes the '/' and, if is not a void tag, adds the closing tag
  */

  'removes the `/` of self-closing tags and auto-close non void tags': {
    data: '<div />\ntext<br />\n<hr/>\n <img src="foo"/>\n <p/>',
    expected: '<div></div> text<br> <hr> <img src="foo"> <p></p>'
  },

  /*
  - Atributes:
    Removes extra whitespace, convert names to lowercase, removes empty values, and enclose values in double quotes.
  */

  'Attributes: Names are converted to lowercase': {
    data: '<div  CLASS="foo" Bar onClick ="f()" foo-Bar="bar" >\n</div>',
    expected: '<div class="foo" bar onclick="f()" foo-bar="bar"> </div>'
  },

  'Attributes: Removes extra whitespace': {
    data: '<div  class = "foo"\n bar style \t="p{}" foo\n=\n "bar" >\n<font size= "14"> text </font></div>',
    expected: '<div class="foo" bar style="p{}" foo="bar"> <font size="14"> text </font></div>'
  },

  'Attributes: Removes empty values': {
    data: '<div  class="" bar style=\'\' foo=>\n<img src="">\n</div>',
    expected: '<div class bar style foo> <img src> </div>'
  },

  'Attributes: Single quoted values are converted to double quoted': {
    data: "<font size= '14' class ='foo' > text</font>",
    expected: '<font size="14" class="foo"> text</font>'
  },

  'Attributes: Unquoted values are enclosed in double quotes': {
    data: '<font size= 14 class =foo > text</font>',
    expected: '<font size="14" class="foo"> text</font>'
  },

  /*
  - Comments:
    Convertion of short notation (`<! >`) to regular (`<!-- -->`).
  */

  'Comments: Convertion of short (`<! >`) to regular (`<!-- -->`) notation': {
    options: { comments: true },
    data: '<body><! comment ></body>',
    expected: '<body><!-- comment --></body>'
  },

  'Comments: Handling HTML sequences within comment': {
    data: '<head><!-- commented out tags <title>Test</title> --></head>',
    expected: '<head></head>'
  },

  'Comments: Inside script code, comments are not touched': {
    data: '<script><!--var foo = 1;--></script>',
    expected: '<script><!--var foo = 1;--></script>'
  },

  'Comments: In html5, unhidden CDATA are comments in short notation': {
    data: '<div><![CDATA[ text ]]></div>',
    expected: '<div></div>'
  },

  /*
    It does not makes other corrections like split tags or auto closing non closed tags.
  */

  'throws on bad closed elements': {
    data: '<div>One <b>Two </div>Three </b>',
    throws: /expected/
  },

  'throws on closing tags with no parent': {
    data: '<div>One <div>Two </font>Three </div></div>',
    throws: /expected/
  },

  'throws on closing *void* tags': {
    data: '<div>One </br>Two',
    throws: /expected/
  },

  'throws on closing *void* tags #2': {
    data: 'text</br>',
    throws: /expected/
  },

  'raises an error on unclosed tags': {
    data: '<div>One <font>Two',
    throws: /expected/
  },

  /*
    Others
  */

  'Unescaped chars in script': {
    data: '<head><script>var foo= "<bar>"; alert(2>foo); var baz =10 <<2; var zip = 10>>1; var yap= "<<>>><<";</script></head>',
    expected: '<head><script>var foo= "<bar>"; alert(2>foo); var baz =10 <<2; var zip = 10>>1; var yap= "<<>>><<";</script></head>'
  },

  'Unescaped characters in style': {
    data: '<style type="text/css">\n body > p\n  { font-weight: bold; }</style>',
    expected: '<style type="text/css"> body > p { font-weight: bold; }</style>'
  }
}

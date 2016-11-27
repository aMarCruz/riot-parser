
## Openning Tags

Start with a `<` followed by a [tag name](#tag-names) or the character `!` that signals the start of a comment, `DOCTYPE` or `CDATA` declaration.

Must there's no spaces between the `<` and the tag name (or `!`), else this is simple text.

Against the html5 specs, tags ending with `/>` are preserved as self-closing tags (the builder must handle this).

## Tag names

Tag names must start with a 7 bit letter (`[a-zA-Z]`) followed by zero o more ISO-8859-1 characters, except those in
`[\x00-\x2F\x7F-\xA0>/]`.

If the first letter is not found, it becomes simple text.
Any non-recognized character ends the tag name (`/` behaves like whitespace).

All the tag names are converted to lower case.

## Attributes

Accepts almost all characters as the tag names and more.

An equal sign (`=`) separates the name of the value. If there's no name, this `=` is the first character of the name (yes). The value can be empty (defaults to `""`).

One or more slashes (`/`) behaves like whitespace. If appears in the name, the slash splits the name generating two attributes, even if the name was quoted.

The first `>` anywhere in the openning tag ends the attribute list, except if this is in a quoted value.

All attribute names are converted to lowercase and the unquoted values are trimmed.

## Comments

Must start with `<!--`. The next following `-->` or the end of file ends the comment.

Comments starting with `<!` (without `--`) ends at the first `>` position:

```html
<! this is a comment > This is regular text.
```

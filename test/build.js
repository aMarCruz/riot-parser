/* eslint-disable no-console */

var format  = process.argv[2] || 'cjs'
var ext     = format !== 'cjs' ? '.' + format + '.js' : '.js'
var sources = ['htmlparser', 'htmlbuilder']

var exec = require('child_process').exec

for (var i = 0; i < sources.length; i++) {
  var command = 'rollup -c -m -f ' + format +
    ' -i src/' + sources[i] + '.js -o dist/' + sources[i] + ext

  exec(command,
    function (err, stdout, stderr) {
      if (stdout) {
        console.log(stdout)
      }
      if (stderr) {
        console.error(stderr)
      }
      if (err) {
        throw err
      }
    })
}

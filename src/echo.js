/*
  Simple "builder" for the parser, only store the output
*/
function echo(/*options*/) {

  var _output
  var _cb

  function _defcb(err) {
    if (err) throw err
  }

  return {
    reset(callback) {
      _output = []
      _cb = typeof callback == 'function' ? callback : _defcb
    },
    write(element) {
      _output.push(element)
    },
    done(err) {
      if (err) {
        _cb(err)
      } else {
        _cb(null, _output)
      }
    },
    getOutput() {
      return _output
    },
  }
}

export default echo

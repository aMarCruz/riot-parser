/*
  Simple "builder" for the parser, only prints the output
*/
function Echo() {

  this.build = function (result) {
    return JSON.stringify(result.output, null, '  ')
  }

}

export default function echo(/*options*/) {
  return new Echo()
}

/*
  http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
*/
'use strict'

function isEmpty(v) {
  if (!v) return true
  return typeof v == 'object'
    ? Array.isArray(v) ? !v.length : !Object.keys(v).length
    : false
}

function compareObjects(a, b) {

  var p

  if (a === b) return true

  for (p in a) {
    if (typeof b[p] == 'undefined') {
      // console.log('Missing property: ', p);
      if (/^(?:start|end|attributes)$/.test(p) ||
        /^(?:childNodes|attrs|_attrs|attrs|_flags)$/.test(p) && isEmpty(a[p])) {
        continue
      }
      return false
    }
    if (a[p]) {
      switch (typeof a[p]) {
        case 'object':
          if (!compareObjects(a[p], b[p])) {
            // console.log('Mismatched property: ', p);
            return false
          }
          break
        case 'function':
          if (typeof b[p] != 'function') {
            // console.log('Mismatched property: ', p);
            return false
          }
          break
        default:
          if (a[p] !== b[p]) {
            // console.log('Mismatched property: ', p);
            return false
          }
      }
    } else if (a[p] !== b[p]) {
      // console.log('Poop: ', p);
      return false
    }
  }

  for (p in b) {
    if (typeof a[p] == 'undefined') {
      // console.log('Extra property: ', p);
      return false
    }
  }

  return true
}

module.exports = compareObjects

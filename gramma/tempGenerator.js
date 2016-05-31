/**
 * Created by liu on 16/5/3.
 */

'use strict';

class TempLabel {
  constructor (name) {
    this.name = name;
  }
  toString() {
    return this.name;
  }
}

class TempGenerator {
  constructor (prefix, attr) {
    this.attr = attr;
    this.prefix = prefix;
    this.counter = 0;
  }

  newTemp(suffix) {
    this.counter++;
    const tl = new TempLabel(this.prefix + this.counter + (suffix ? suffix : ''));
    for (let i in this.attr) {
      tl[i] = this.attr[i];
    }
    return tl;
  }
}

const tempGenSet = {};
function gen(prefix, attr) {
  if (tempGenSet[prefix] === undefined) {
    tempGenSet[prefix] = new TempGenerator(prefix, attr);
  }
  return tempGenSet[prefix];
}

module.exports = gen;

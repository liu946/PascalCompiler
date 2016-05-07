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
  constructor (prefix) {
    this.prefix = prefix;
    this.counter = 0;
  }

  newTemp(suffix) {
    this.counter++;
    return new TempLabel(this.prefix + this.counter + (suffix ? suffix : ''));
  }
}

const tempGenSet = {};
function gen(prefix) {
  if (tempGenSet[prefix] === undefined) {
    tempGenSet[prefix] = new TempGenerator(prefix);
  }
  return tempGenSet[prefix];
}

module.exports = gen;

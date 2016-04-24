/**
 * Created by liu on 16/4/23.
 */

'use strict';
const Symbol = require('./symbol');
class SymbolStack {
  constructor() {
    this.stack = [];
  }

  push(symbol) {
    this.stack.push(new Symbol(symbol));
  }

  pop(num) {
    if (num > this.stack.length) {
      throw '要求弹出数目超过栈空间';
    }
    return this.stack.splice(this.stack.length - num, num);
  }

  length() {
    return this.stack.length;
  }

  toString() {
    return this.stack.map((x)=>x.toString()).join(' ');
  }
}

module.exports = SymbolStack;
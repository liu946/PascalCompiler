/**
 * Created by liu on 16/4/23.
 */
'use strict';

class Symbol {
  constructor(word){
    if (typeof word === 'string') { // 非终结符名称
      this.type = word;
      this.attr = {};
    } else if (word.attr && word.type) { // symbol对象，应该返回自身
      this.type = word.type;
      this.attr = word.attr;
    } else {// 终结符，token，token.type,token.value;
      this.type = word.type;
      this.attr = {};
      this.setAttr('word', word);
      if(word.value !== undefined) this.setAttr('value', word.value);
    }
    return this;
  }

  setAttr(key, val) {
    this.attr[key] = val;
  }

  getAttr(key) {
    return this.attr[key];
  }

  toString() {
    return this.type + '(' +JSON.stringify(this.attr) + ')';
  }
}

module.exports = Symbol;

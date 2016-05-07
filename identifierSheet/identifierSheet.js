/**
 * Created by liu on 16/4/19.
 */
'use strict';
const Identifier = require('./identifier');

/**
 * 符号表
 * @not_singleton
 * 符号表的结构如下
 * {
 *  [name]: {
 *    type: 'var',
 *    [others]
 *  },
 *  ...
 * }
 *
 * @note:
 * 1. 名字可以使用连续内存存储字符串，而每个名字字段存储偏移
 *
 */
class IdentifierSheet {
  constructor(parent) {
    parent = parent ? parent : null;
    this.sheet = {};
    this.parentSheet = parent;
    this.lastAddress = 0;
    this.memoryGrid = 4;
    return this;
  }



  /**
   * 合并两个符号表
   * @param that
   * @returns {IdentifierSheet}
   */
  combine (that) {
    for (let symbolName in that.sheet) {
      this.register(symbol, that.sheet[symbolName]);
    }
    return this;
  }

  incraceAddress (space) {
    this.lastAddress += space;
    if (this.lastAddress % this.memoryGrid)
      this.lastAddress += this.memoryGrid - (this.lastAddress % this.memoryGrid);
  }

  /**
   *
   * @param name
   * @param symbolDescribe .type .space
   */
  register(name, symbolDescribe) {
    if (this.sheet[name] !== undefined) {
      throw name + ' is already defined in this scope!';
    } else {
      this.sheet[name] = new Identifier(symbolDescribe, this.lastAddress, name);
      this.incraceAddress(symbolDescribe.space);
    }
  }

  getDescribe(name) {
    if (this.sheet[name] !== undefined) {
      return this.sheet[name];
    } else if (this.parentSheet !== null) {
      return this.parentSheet.getDescribe(name);
    } else {
      throw 'undefined symbol ' + name;
    }
  }

  toString() {
    let str = '';
    for (let id in this.sheet) {
      str += (this.sheet[id].toString() + '\n');
    }
    return str;
  }
}

module.exports = IdentifierSheet;

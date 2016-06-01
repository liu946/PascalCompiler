/**
 * Created by liu on 16/4/19.
 */
'use strict';
const Identifier = require('./identifier');
const strLabel = require('../gramma/tempGenerator')('STR_', {type: 'addrLabel'});

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
    this.parentSheet = parent;
    this.idSheetMap = {};
    this.lastAddress = 0;
    this.memoryGrid = 4;
    this.constStrMap = {};
    return this;
  }

  registerStr(word) {
    const newStr = strLabel.newTemp();
    this.constStrMap[newStr.toString()] = word.getAttr('value');
    return newStr;
  }


  writeBack() {
    for (let i in this.idSheetMap) {
      this.idSheetMap[i].writeBack();
    }
  }

  /**
   * 合并两个符号表
   * @param that
   * @returns {IdentifierSheet}
   */
  combine (that) {
    for (let symbolName in that.idSheetMap) {
      this.register(symbol, that.idSheetMap[symbolName]);
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
  register(name, symbolDescribe, type) {
    if (this.idSheetMap[name] !== undefined) {
      return null;
    } else {
      this.idSheetMap[name] = new Identifier(symbolDescribe, this.lastAddress, name, type);
      this.incraceAddress(symbolDescribe.space);
    }
  }

  getDescribe(name) {
    if (this.idSheetMap[name] !== undefined) {
      return this.idSheetMap[name];
    } else if (this.parentSheet !== null) {
      return this.parentSheet.getDescribe(name);
    } else {
      return null;
    }
  }

  toString() {
    let str = '';
    for (let id in this.idSheetMap) {
      str += (this.idSheetMap[id].toString() + '\n');
    }
    return str;
  }
}

module.exports = IdentifierSheet;

/**
 * Created by liu on 16/5/1.
 */
'use strict';
const debug = require('debug')('idSheet');
class Sheet {
  constructor() {
    this.sheetHead = null;
    this.sheetMap = {};
  }

  writeBack() {
    return this.sheetHead.writeBack();
  }

  push(identifierSheet) {
    this.sheetHead = identifierSheet;
    debug('新的符号表被建立\n' + this.sheetHead.toString());
  }

  pop() {
    this.sheetHead = this.sheetHead.parentSheet;
  }

  setSheet(name) {
    return this.sheetHead = this.sheetMap[name];
  }

  setSheetName(name) {
    return this.sheetMap[name] = this.sheetHead;
  }

  register(name, symbolDescribe) {
    return this.sheetHead.register(name, symbolDescribe);
  }

  getDescribe(name) {
    return this.sheetHead.getDescribe(name);
  }

  registerStr(word) {
    return this.sheetHead.registerStr(word);
  }

  getConstStrMap() {
    return this.sheetHead.constStrMap;
  }

  getIdSheetMap() {
    return this.sheetHead.idSheetMap;
  }
}

//singleton
const gen = function () {
  return new Sheet();
};
module.exports = gen();

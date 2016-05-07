/**
 * Created by liu on 16/5/1.
 */
'use strict';
const IdentifierSheet = require('./identifierSheet');
const debug = require('debug')('IDSheet');
class Sheet {
  constructor() {
    this.sheetHead = null;
  }

  pushNew() {
    this.sheetHead = new IdentifierSheet(this.sheetHead);
  }

  push(identifierSheet) {
    identifierSheet.parentSheet = this.sheetHead;
    this.sheetHead = identifierSheet;
    debug('新的符号表被建立\n' + this.sheetHead.toString());
  }

  pop() {
    this.sheetHead = this.sheetHead.parentSheet;
  }

  register(name, symbolDescribe) {
    return this.sheetHead.register(name, symbolDescribe);
  }

  getDescribe(name) {
    return this.sheetHead.getDescribe(name);
  }
}

//singleton
module.exports = new Sheet();

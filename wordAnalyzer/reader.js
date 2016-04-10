/**
 * Created by liu on 16/3/28.
 */
"use strict";
const debug = require('debug')('Reader');
const assert = require('assert');
const format = require('string-format');
format.extend(String.prototype);

class Reader {
  constructor(string, legalChar) {
    this.code = string;
    this.legalCharMap = legalChar.split('').reduce((p, c)=>{p[c]=true;return p}, {});
    this.lineNum = 0;
    this.inlineCharNum = 0;
    this.escapeChar = 0;
  }

  get(pointer) {
    let char = this.code[pointer + this.escapeChar];
    if (this.legalCharMap[char]) {
      if (char === '\n') {
        this.lineNum++;
        this.inlineCharNum = 0;
      }
      this.inlineCharNum++;
      return char;
    } else {
      debug('非法的输入符号 "' + char + '"(' + char.charCodeAt(0) + ') 位置 ' + this.formatReadingPosition());
      return this.catchError(pointer);
    }
  }

  catchError(pointer) {
    this.escapeChar++;
    this.get(pointer);
  }

  uncheckGet(pointer) {
    return this.code[pointer + this.escapeChar];
  }

  readingPosition() {
    return {
      line: this.lineNum,
      char: this.inlineCharNum,
    };
  }

  formatReadingPosition() {
    let pos = this.readingPosition();
    return pos.line + " 行，" + pos.char + "字符";
  }
}

module.exports = Reader;

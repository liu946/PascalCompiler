/**
 * Created by liu on 16/5/3.
 */

'use strict';
const Code = require('./code');

class CodeList {
  constructor() {
    this.list = [];
  }

  genCode(op, a1, a2, result) {
    this.list.push(new Code(op, a1, a2, result));
  }

  genCodeList(codeList) {
    this.list = this.list.concat(codeList);
  }

  toString() {
    return this.list.map((x) => x.toString()).join('\n');
  }

  print() {
    console.log(this.toString());
  }
}


//singleton
const code = new CodeList();
code.OP = Code.OP;
module.exports = code;

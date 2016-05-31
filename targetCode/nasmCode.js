/**
 * Created by liu on 16/5/17.
 */
'use strict';

const OP = {
  MOV: 'MOV',
  PUSH: 'PUSH',
  POP: 'POP',
  CALL: 'CALL',
  GOTO: 'GOTO',

};


class Code {
  constructor(code) {
    this.label = '';
    this.code = code;
  }

  toString() {
    return this.label + this.code.toString();
  }
}

class genCode {
  constructor() {
    this.codeList = [];
  }

  gen(code) {
    this.codeList.push(new Code(code));
  }

  toString() {
    return this.codeList.join('\n');
  }

  changeTarget(targetLabel) {
    this.codeList[this.codeList.length - 1].result = targetLabel;
  }
}

module.exports = genCode;

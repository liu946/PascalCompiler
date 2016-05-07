/**
 * Created by liu on 16/5/2.
 */
'use strict';

function fill(number, decimals, element) {
  if (element === undefined) element = ' ';
  number = String(number);
  if(number.length < decimals)
    return number + new Array(decimals-number.length+1).join(element);
  else
    return number;
}

class Code {
  constructor (op, a1, a2, result) {
    this.op = op;
    this.a1 = a1 ? a1 : null;
    this.a2 = a2 ? a2 : null;
    this.result = result ? result : null;
  }

  changeResult (result) {
    this.result = result;
  }

  toString() {
    return fill(this.op, 20) + fill(this.a1, 20) + fill(this.a2, 20) + "=>  " + fill(this.result, 20) + '// '+
      (Code.OPstring[this.op] ? Code.OPstring[this.op]: Code.OPstring.DEFAULT)(this.a1, this.a2, this.result);
  }
}

Code.OPstring = {
  AASSIGN: function (a1, a2, result) {
    return result + '[' + a1 + ']=' + a2;
  },
  DEFAULT: function () {
    return '';
  }

};

Code.OP = {
  ADD : 'ADD', //result = a1 op a2
  MINUS : 'MINUS',
  MUL : 'MUL',
  DIV : 'DIV',
  NEG : 'NEG', // result = op a1  //a2 = null

  ASSIGN : 'ASSIGN', // result = a1
  AASSIGN : 'AASSIGN', // result[a1] = a2
  ASSIGNA : 'ASSIGNA', // result = a1[a2]

  PARAM : 'PARAM', // param a1
  CALL : 'CALL', // call a1(...a2)

  GOTO : 'GOTO', // goto result
  CJ : 'CJ', // if a1 goto result
  EJ : 'EJ', // if a1 == a2 goto result
  UJ : 'UJ', // if a1 > a2 goto result
  LJ : 'LJ', // if a1 < a2 goto result

};

module.exports = Code;

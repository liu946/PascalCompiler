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
  constructor (op, a1, a2, result, label) {
    this.op = op;
    this.a1 = a1 ? a1 : null;
    this.a2 = a2 ? a2 : null;
    this.result = result ? result : null;
    this.label = label ? label : '';
  }

  changeResult (result) {
    this.result = result;
  }

  toString() {
    return fill(this.label, 5) + fill(this.op, 20) + fill(this.a1, 20) + fill(this.a2, 20) + "=>  " + fill(this.result, 20) + '// '+
      fill(this.label, 4) + (Code.OPstring[this.op] ? Code.OPstring[this.op]: Code.OPstring.DEFAULT)(this.a1, this.a2, this.result);
  }
}

function ifExpressionGenerator(opSymbol) {
  return function (a1, a2, result) {//'EQ', // if a1 == a2 goto result
    return 'if ' + a1 + ' ' + opSymbol + ' ' + a2 + ' goto ' + result;
  }
}

function calExpressionGenerator(opSymbol) {
  return function (a1, a2, result) {//'EQ', // if a1 == a2 goto result
    return result + ' = ' + a1 + ' ' + opSymbol + ' ' + a2;
  }
}

Code.OPstring = {
  /**
   * 
   * @param a1
   * @param a2
   * @param result
   * @returns {string}
   * @constructor
   */
  AASSIGN: function (a1, a2, result) {
    return result + '[' + a1 + '] = ' + a2;
  },
  ASSIGN: function (a1, a2, result) {
    return result + ' = ' + a1;
  },
  GOTO: function (a1, a2, result) {//'EQ', // if a1 == a2 goto result
    return 'goto ' + result;
  },
  ADD : calExpressionGenerator('+'), //result = a1 op a2
  MINUS : calExpressionGenerator('-'),
  MUL : calExpressionGenerator('*'),
  DIV : calExpressionGenerator('/'),
  NEG : function (a1, a2, result) {
    return result + ' = - ' + a1;
  },
  EQ: ifExpressionGenerator('=='),//'EQ', // if a1 == a2 goto result
  LT: ifExpressionGenerator('<'),//'LT', // if a1 < a2 goto result
  GT: ifExpressionGenerator('>'),//'GT', // if a1 > a2 goto result
  LE: ifExpressionGenerator('<='),//'LE', // if a1 <= a2 goto result
  GE: ifExpressionGenerator('>='),//'GE', // if a1 >= a2 goto result
  NE: ifExpressionGenerator('<>'),//'NE', // if a1 <> a2 goto result
  DEFAULT: function () {
    return '';
  }
};

Code.backpatch = function (labelList, label) {
  labelList.map((x) => (x.name = label.name));
};

Code.OP = {
  NOP : 'NOP', // no option
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

  EQ : 'EQ', // if a1 == a2 goto result
  LT : 'LT', // if a1 < a2 goto result
  GT : 'GT', // if a1 > a2 goto result
  LE : 'LE', // if a1 <= a2 goto result
  GE : 'GE', // if a1 >= a2 goto result
  NE : 'NE', // if a1 <> a2 goto result

};

module.exports = Code;

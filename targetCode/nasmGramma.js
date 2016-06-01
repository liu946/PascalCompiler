/**
 * Created by liu on 16/5/17.
 */
'use strict';

const idSheet = require('../identifierSheet');
const targetCode = require('./index');
let allocer = null;

function calculateGrammaGenerator(op) {
  return function (a1, a2, result) {
    let a1c = a1, a2c = a2;
    if (a1.type === 'ID')
      a1c = idSheet.getDescribe(a1).getVarByReg();
    if (a2.type === 'ID')
      a2c = idSheet.getDescribe(a2).getVarByMemOrReg();
    targetCode.getGenerator().gen(op + ' ' + a1c.toString() + ', ' + a2c.toString());
    if (a1.type === 'ID'){
      idSheet.getDescribe(a1).removeIn(a1c);
      a1c.setIn(idSheet.getDescribe(result.toString()));
    }
    idSheet.getDescribe(result).setIn(a1c);

  };
}

function conditionJmpGenerator(op) {
  return function (a1, a2, result) {
    let a1c = a1, a2c = a2;
    if (a1.type === 'ID')
      a1c = idSheet.getDescribe(a1).getVarByReg();
    if (a2.type === 'ID')
      a2c = idSheet.getDescribe(a2).getVarByReg();
    targetCode.getGenerator().gen('CMP ' + a1c.toString() + ', ' + a2c.toString());
    targetCode.getGenerator().gen(op + ' ' + result.toString());
  }
}

/**
 * 针对三地址码的汇编翻译方式
 * @type {{}}
 */
const gramma = {
  /**
   *
   * @param a1
   * @param a2
   * @param result
   * @param code 这个是传入用来构造这个block的目标码列表的
   * @constructor
   */
  ADD: calculateGrammaGenerator('ADD'),

  AASSIGN: function (a1, a2, result) {
    let a1c = a1, a2c = a2;
    result = idSheet.getDescribe(result);
    if (a1.type === 'ID')
      a1c = idSheet.getDescribe(a1).getVarByReg();
    if (a2.type === 'ID')
      a2c = idSheet.getDescribe(a2).getVarByReg();
    targetCode.getGenerator().gen('MOV [' + result.name + ' + ' + a1c + '], ' + a2c);
  },
  ASSIGNA: function (a1, a2, result) {
    if (!allocer) allocer = require('./registerAllocer');
    let a2c = a2;
    const rec = idSheet.getDescribe(result).getVarByMemOrReg();
    if (a2.type === 'ID')
      a2c = idSheet.getDescribe(a2).getVarByReg();
    const tempReg = allocer.getBlankReg();
    targetCode.getGenerator().gen('MOV ' + tempReg + ', [' + a1.toString() + '+' + a2c +']');
    targetCode.getGenerator().gen('MOV ' + rec + ', ' + tempReg);
  },
  ASSIGN: function (a1, a2, result) {
    if (a1.type === 'ID') {
      const a1r = idSheet.getDescribe(a1).getVarByReg();
      a1r.addIn(result.toString());
      idSheet.getDescribe(result.toString()).setIn(a1r);
    } else {
      const rec = idSheet.getDescribe(result).getVarByMemOrReg();
      targetCode.getGenerator().gen('MOV ' + rec + ', ' + a1.toString());
    }
  },
  GOTO: function (a1, a2, result) {
    targetCode.getGenerator().gen('JMP '+ result.toString());
  },
  MINUS:  calculateGrammaGenerator('SUB'),
  MUL: calculateGrammaGenerator('IMUL'),
  // function (a1, a2, result) {
  //   let a1c = a1, a2c = a2;
  //   if (a1.type === 'ID')
  //     a1c = idSheet.getDescribe(a1).allocRegister('EAX');
  //   if (a2.type === 'ID')
  //     a2c = idSheet.getDescribe(a2).getVarByReg();
  //   targetCode.getGenerator().gen(op + ' ' + a1c.toString() + ', ' + a2c.toString());
  //   if (a1.type === 'ID')
  //     idSheet.getDescribe(a1).removeIn(a1c);
  //   idSheet.getDescribe(result).setIn(a1c);
  //
  // },
  DIV: function (a1, a2, result) {

  },
  NEG:  function (a1, a2, result) {

  },
  EQ: conditionJmpGenerator('JE'),
  LT: conditionJmpGenerator('JB'),
  GT: conditionJmpGenerator('JA'),
  LE: conditionJmpGenerator('JNA'),
  GE: conditionJmpGenerator('JNB'),
  NE: conditionJmpGenerator('JNE'),
  DEFAULT:  function (a1, a2, result) {

  },
  PARAM:  function (a1, a2, result) {
    if (a1.type === 'addrLabel') {
      targetCode.getGenerator().gen('push offset ' + a1.toString());
    }else if (a1.type === 'ID') {
      const a1r = idSheet.getDescribe(a1).getVarByMemOrReg();
      targetCode.getGenerator().gen('push ' + a1r.toString());
    } else {
      targetCode.getGenerator().gen('push ' + a1.toString());
    }
  },
  CALL:  function (a1, a2, result) {
    targetCode.getGenerator().gen('CALL ' + a1.toString());
    if (result) {
      idSheet.getDescribe(result).setIn('EAX');
    }
  },
  EXIT: function (a1, a2, result) {
    targetCode.getGenerator().gen('invoke	_getche');
    targetCode.getGenerator().gen('invoke ExitProcess,0');
    targetCode.getGenerator().gen('main	endp');
    targetCode.getGenerator().gen('end   main');
  }
};

module.exports = gramma;

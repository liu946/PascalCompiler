/**
 * Created by liu on 16/5/3.
 */
'use strict';

const code = require('../threeAddressCode');
const tempVar = require('./tempGenerator')('tmp_', {type: 'ID'});
const sheet = require('../identifierSheet');
//<E> + <E>
exports.expressionCalculate  = function (op) {
  return function (leftSymbol, rightList) {
    leftSymbol.setAttr('addr', tempVar.newTemp());
    let c2 = rightList[2].getAttr('addr');
    if (rightList[0].getAttr('pointer') && op === code.OP.ADD) {
      c2 = tempVar.newTemp();
      code.genCode(code.OP.MUL, rightList[2].getAttr('addr'), rightList[0].getAttr('baseTypeSpace'), c2);

      leftSymbol.setAttr('baseTypeSpace', rightList[0].getAttr('baseTypeSpace'));
      leftSymbol.setAttr('pointer', true);
    }
    const calCode = code.genCode(op, rightList[0].getAttr('addr'), c2, leftSymbol.getAttr('addr'));
    leftSymbol.setAttr('code', calCode);
  };
};
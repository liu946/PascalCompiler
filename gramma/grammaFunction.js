/**
 * Created by liu on 16/5/3.
 */
'use strict';

const code = require('../threeAddressCode');
const tempVar = require('./tempGenerator')('$$');
const tempLabel = require('./tempGenerator')('@@');

exports.expressionCalculate  = function (op) {
  return function (leftSymbol, rightList) {
    leftSymbol.setAttr('addr', tempVar.newTemp());
    code.genCode(op, rightList[0].getAttr('addr'), rightList[2].getAttr('addr'), leftSymbol.getAttr('addr'));
  };
};
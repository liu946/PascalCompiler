/**
 * Created by liu on 16/5/3.
 */
'use strict';

const sheet = require('../identifierSheet');
const IDSheet = require('../identifierSheet/identifierSheet');

exports.STARTSYMBOL = '<Program>';

// VAR <Var-decl-list>
exports.declare = function () {
  return function(leftSymbol, rightList, brotherSymbol) {
    // 这里装入符号表
    const idSheet =
      brotherSymbol
        ?
        brotherSymbol.getAttr('iDSheet').combine(rightList[1].getAttr('iDSheet'))
        :
        rightList[1].getAttr('iDSheet');

    leftSymbol.setAttr('iDSheet', idSheet);
    sheet.push(idSheet);
  }
};

/**
 * 处理如下生成式
 *  // ARRAY LS_BRAC INT_EXP RANGE INT_EXP RS_BRAC OF <Var-basic-type>
 *  // ARRAY LS_BRAC REAL_EXP DOT INT_EXP RS_BRAC OF <Var-basic-type>
 * @returns {Function}
 */
exports.arrayType = function() {
  return function (leftSymbol, rightList) {
    const start = parseInt(rightList[2].getAttr('value'));
    const end = parseInt(rightList[4].getAttr('value'));
    if (end < start) throw '数组元素索引范围有误。';
    leftSymbol.setAttr('type', 'ARRAY ' + rightList[7].getAttr('type') + ' ' + start + ' ' + end);
    leftSymbol.setAttr('space', rightList[7].getAttr('space') * (end - start + 1));
    leftSymbol.setAttr('baseTypeSpace', rightList[7].getAttr('space'));
    leftSymbol.setAttr('start', start);
    leftSymbol.setAttr('end', end);
  };
};



// <Var-ids> COLON <Var-type> SEMIC <Var-decl-list>
exports.declareList = function () {
  return function(leftSymbol, rightList) {
    // 这里注册符号表
    let idSheet = rightList[4].getAttr('iDSheet') ? rightList[4].getAttr('iDSheet') : new IDSheet();
    leftSymbol.setAttr('iDSheet', idSheet);
    for (let id of rightList[0].getAttr('ids')) {
      idSheet.register(id, rightList[2].attr);
    }
  };
};


// <Var-ids> COMMA ID
/**
 *
 * @returns {Function} (return ids [name..])
 */
exports.ids = function () {
  return function(leftSymbol, rightList) {
    const list = rightList[0].getAttr('ids');
    list.push(rightList[2].getAttr('value'));
    leftSymbol.setAttr('ids',list);
  }
};
// ID
exports.id = function () {
  return function(leftSymbol, rightList) {
    leftSymbol.setAttr('ids', [rightList[0].getAttr('value')]);
  };
};


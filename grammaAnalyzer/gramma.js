/**
 * Created by liu on 16/4/16.
 */
'use strict';

const basicGramma = require('../gramma');
const gramma = {};
for (let key in basicGramma) {
  gramma[key] = basicGramma[key].map((x) => x.generatorRight);
}
module.exports = gramma;

// 测试文法2
//module.exports = {
//  '<S>': ['<L> = <R>', '<R>'],
//  '<L>': ['* <R>', 'i'],
//  '<R>': ['<L>'],
//};

//// 自动机测试文法 成功
//module.exports = {
//  '<S>': ['<C> <C>'],
//  '<C>': ['c <C>', 'd'],
//};

//module.exports = {
//  '<Program>':    ['PROGRAM ID SEMIC <Block>'],
//  '<Block>':      ['<Const-decl> <Var-decl> <Proc-decl> <Statement>'],
//  '<Const-decl>': [''],
//  '<Var-decl>':   [''],
//  '<Proc-decl>':  [''],
//  '<Statement>':  [ 'ID LR_BRAC <Expression> RR_BRAC', //函数调用，todo 多参数
//                    'BEGIN <Statement-list> END F_STOP',
//                    //'IF <Condition> then <Statement>',
//                    //'WHILE <Condition> DO <Statement>'
//                    '',
//  ],
//  '<Statement-list>': ['<Statement>', '<Statement-list> SEMIC <Statement>'],
//  '<Expression>': ['STRING'],
//};

//Program main;
//Begin
//  print('Hello World!')
//End.
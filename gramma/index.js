/**
 * Created by liu on 16/4/23.
 */

'use strict';

const codeList = require('../threeAddressCode');
const Code = require('../threeAddressCode/code');
const Definition = require('./definition');
const grammaFunction = require('./grammaFunction');
const boolExpression = require('./boolExpression');
const sheet = require('../identifierSheet');
const loopStack = require('./loopStack');

const tempVar = require('./tempGenerator')('$$');
const tempLabel = require('./tempGenerator')('@@');

const basicTypeSpace = {
  'INTEGER':4,
  'REAL':8,
  'CHAR':1,
  'BOOLEAN':1,
};

function basicTypeOperation (leftSymbol, rightList) {
  const typeName = rightList[0].type;
  leftSymbol.setAttr('type', typeName);
  leftSymbol.setAttr('space', basicTypeSpace[typeName]);
}

// tool function
function copyAttr (leftSymbol, rightList) {
  leftSymbol.attr = rightList[0].attr;
}

const gramma = {
  '<Program>': [
    {
      generatorRight: 'PROGRAM ID SEMIC <Block>',
      generatorFunction: undefined, // 使用这种方式执行操作
    },
  ],
  '<Block>': [
    {
      generatorRight: '<Var-decl> <Proc-decl> <Body>',
    },
  ],
  //<editor-fold desc='变量声明语句块，对外接口<Var-decl>'>
  '<Var-decl>': [
    {
      generatorRight: '',
    },
    {
      generatorRight: 'VAR <Var-decl-list>',
      generatorFunction: Definition.declare(),
    },
  ],
  '<Var-decl-list>': [
    {
      generatorRight: '<Var-ids> COLON <Var-type> SEMIC <Var-decl-list>',
      generatorFunction: Definition.declareList(),
    },
    {
      generatorRight: '',
    },
  ],
  '<Var-ids>': [
    {
      generatorRight: '<Var-ids> COMMA ID',
      generatorFunction: Definition.ids(),
    },
    {
      generatorRight: 'ID',
      generatorFunction: Definition.id(),
    },
  ],
  '<Var-type>': [
    {
      generatorRight: '<Var-basic-type>',
      generatorFunction: copyAttr,
    },
    {
      generatorRight: '<Array-type>',
      generatorFunction: copyAttr,
    }
  ],
  '<Array-type>' : [
    {
      generatorRight: 'ARRAY LS_BRAC INT_EXP RANGE INT_EXP RS_BRAC OF <Var-basic-type>',
      generatorFunction: Definition.arrayType(),
    },
    {
      generatorRight: 'ARRAY LS_BRAC REAL_EXP DOT INT_EXP RS_BRAC OF <Var-basic-type>',
      generatorFunction: Definition.arrayType(),
    },
  ],
  '<Var-basic-type>': [
    {
      generatorRight: 'INTEGER',
      generatorFunction: basicTypeOperation,
    },
    {
      generatorRight: 'REAL',
      generatorFunction: basicTypeOperation,
    },
    {
      generatorRight: 'CHAR',
      generatorFunction: basicTypeOperation,
    },
    {
      generatorRight: 'BOOLEAN',
      generatorFunction: basicTypeOperation,
    },
  ],
  //</editor-fold>

  //<editor-fold desc='子过程声明语句块，对外接口<Proc-decl>'>

  '<Proc-decl>': [
    {
      generatorRight: '',
    },
    {
      generatorRight: 'PROC <Proc-entry> ID LR_BRAC <Var-decl-list> RR_BRAC COLON <Var-type> SEMIC <Block> <Proc-decl>',
      generatorFunction: function (leftSymbol, rightList) {
        // 弹出符号表
        // 注册id(函数名)

      }
    },
  ],
  '<Proc-entry>': [
    {
      generatorRight: '',
      generatorFunction: function (leftSymbol, rightList) {
        // 压入新的符号表
        // 记录过程入口地址
      },
    },
  ],
  //</editor-fold>

  '<Body>': [
    {
      generatorRight: 'BEGIN <Statement-list> END F_STOP',
      generatorFunction: function (leftSymbol, rightList) {
        if (rightList[1].getAttr('nextList').length) {
          codeList.backPatch(rightList[1].getAttr('nextList'), codeList.getNextLineCode());
          codeList.genCode(Code.OP.NOP, null, null, null);
        }
      },
    },
  ],
  '<Statement-list>': [
    {
      generatorRight: '<Statement-list> <M> <Statement>',
      generatorFunction: function (leftSymbol, rightList) {
        codeList.backPatch(rightList[0].getAttr('nextList'), rightList[1].getAttr('instr'));
        leftSymbol.setAttr('nextList', rightList[2].getAttr('nextList'));
      },
    },
    {
      generatorRight: '<Statement>',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('nextList', rightList[0].getAttr('nextList'));
      },
    }
  ],
  '<Statement>': [
    {
      generatorRight: '', //空语句
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('nextList', []);
      },
    },
    {
      generatorRight: 'IF <Boolean-exp> THEN <M> <Statement>',//IF 语句
      generatorFunction: function (leftSymbol, rightList) {
        codeList.backPatch(rightList[1].getAttr('trueList'), rightList[3].getAttr('instr'));
        leftSymbol.setAttr('nextList', rightList[1].getAttr('falseList').concat(rightList[4].getAttr('nextList')));
      },
    },
    {
      generatorRight: 'IF <Boolean-exp> THEN <M> <Statement> <N> ELSE <M> <Statement>',//IF ELSE语句
      generatorFunction: function (leftSymbol, rightList) {
        codeList.backPatch(rightList[1].getAttr('trueList'), rightList[3].getAttr('instr'));
        codeList.backPatch(rightList[1].getAttr('falseList'), rightList[7].getAttr('instr'));
        leftSymbol.setAttr('nextList',
          rightList[4].getAttr('nextList').concat
          (rightList[5].getAttr('nextList')).concat
          (rightList[8].getAttr('nextList'))
        );
      },
    },
    {
      generatorRight: 'WHILE <M> <Boolean-exp> DO <Loop-entry> <M> <Statement>',//WHILE
      generatorFunction: function (leftSymbol, rightList) {
        codeList.backPatch(rightList[6].getAttr('nextList'), rightList[1].getAttr('instr'));
        codeList.backPatch(rightList[2].getAttr('trueList'), rightList[5].getAttr('instr'));
        leftSymbol.setAttr('nextList', rightList[2].getAttr('falseList').concat(loopStack.popBreakList()));
        codeList.genCode(Code.OP.GOTO, null, null, rightList[1].getAttr('instr'));
      },
    },
    {
      generatorRight: 'BREAK SEMIC',
      generatorFunction: function (leftSymbol, rightList) {
        loopStack.registerBreak(codeList.getNextLineCode());
        leftSymbol.setAttr('nextList', []);
        codeList.genCode(Code.OP.GOTO, null, null, null);
      },
    },
    {
      generatorRight: 'BEGIN <Statement-list> END',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('nextList', rightList[1].getAttr('nextList'));
      },
    },
    {
      generatorRight: 'ID ASSIGN <Expression> SEMIC',//赋值语句 id = ???
      generatorFunction: function (leftSymbol, rightList) {
        if (rightList[2].getAttr('code')) {
          rightList[2].getAttr('code').changeResult(rightList[0].getAttr('addr'));
        } else {
          codeList.genCode(Code.OP.ASSIGN, rightList[2].getAttr('addr'), null, rightList[0].getAttr('value'));
        }
        leftSymbol.setAttr('nextList', []);
      },
    },
    {
      generatorRight: '<Array-exp> ASSIGN <Expression> SEMIC',//赋值语句 a[1] = ???
      generatorFunction: function (leftSymbol, rightList) {
        codeList.genCode(Code.OP.AASSIGN,
          rightList[0].getAttr('offset'),
          rightList[2].getAttr('addr'),
          rightList[0].getAttr('baseAddr'));
        leftSymbol.setAttr('nextList', []);
      },
    },
    {
      generatorRight: '<Proc-call> SEMIC',//函数调用
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('nextList', []);
      },
    },
  ],
  '<Loop-entry>': [
    {
      generatorRight: '',
      generatorFunction: function (leftSymbol, rightList) {
        loopStack.enterNewLoop();
      },
    }
  ],
  '<M>': [
    {
      generatorRight: '',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('instr', codeList.getNextLineCode());
      },
    }
  ],
  '<N>': [
    {
      generatorRight: '',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('nextList', [codeList.getNextLineCode()]);
        codeList.genCode(Code.OP.GOTO, null, null, null);
      },
    }
  ],
  //<editor-fold desc='赋值'>
  '<Array-exp>': [
    {
      generatorRight: 'ID LS_BRAC <Number-expression> RS_BRAC',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('baseAddr', rightList[0].getAttr('value'));
        const type = sheet.getDescribe(rightList[0].getAttr('value')).attr;
        const index = tempVar.newTemp();
        codeList.genCode(Code.OP.MUL, rightList[2].getAttr('addr'), type.baseTypeSpace, index);
        leftSymbol.setAttr('offset', index);
      },
    }
  ],
  //</editor-fold>
  '<Number-expression>': [ // todo: 索引运算，目前只支持变量和常数
    {
      generatorRight: 'ID',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('addr', rightList[0].getAttr('value'));
      },
    },
    {
      generatorRight: 'INT_EXP',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('addr', rightList[0].getAttr('value'));
      },
    },
  ],
  '<Expression>': [
    {
      generatorRight: 'INT_EXP',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('addr', rightList[0].getAttr('value'));
      },
    },
    {
      generatorRight: 'REAL_EXP',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('addr', rightList[0].getAttr('value'));
      },
    },
    {
      generatorRight: 'ID',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('addr', rightList[0].getAttr('value'));
      },
    },
    {
      generatorRight: '<Expression> PLUS <Expression>',
      generatorFunction: grammaFunction.expressionCalculate(codeList.OP.ADD),
    },
    {
      generatorRight: '<Expression> MINUS <Expression>',
      generatorFunction: grammaFunction.expressionCalculate(codeList.OP.MINUS),
    },
    {
      generatorRight: '<Expression> MULTI <Expression>',
      generatorFunction: grammaFunction.expressionCalculate(codeList.OP.MUL),
    },
    {
      generatorRight: '<Expression> RDIV <Expression>',
      generatorFunction: grammaFunction.expressionCalculate(codeList.OP.DIV),
    },
    {
      generatorRight: 'LR_BRAC <Expression> RR_BRAC',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('addr', rightList[1].getAttr('addr'));
      },
    },
  ],
  '<Proc-call>': [
    {
      generatorRight: 'ID LR_BRAC <Expression-list> RR_BRAC',
      generatorFunction: function (leftSymbol, rightList) {
        codeList.genCode(Code.OP.CALL, rightList[0].getAttr('value'), rightList[2].getAttr('argumentNum'), null);
      }
    }
  ],
  '<Expression-list>': [
    {
      generatorRight: '<Expression>',
      generatorFunction: function (leftSymbol, rightList) {
        codeList.genCode(Code.OP.PARAM, rightList[0].getAttr('addr'));
        leftSymbol.setAttr('argumentNum', 1);
      },
    },
    {
      generatorRight: '<Expression> COMMA <Expression-list>',
      generatorFunction: function (leftSymbol, rightList) {
        codeList.genCode(Code.OP.PARAM, rightList[0].getAttr('addr'));
        leftSymbol.setAttr('argumentNum', rightList[2].getAttr('argumentNum') + 1);
      },
    }
  ],
  '<Boolean-exp>': [
    {
      generatorRight: '<Boolean-exp> AND <M> <Boolean-exp>',
      generatorFunction: function (leftSymbol, rightList) {
        codeList.backPatch(rightList[0].getAttr('trueList'), rightList[2].getAttr('instr'));
        leftSymbol.setAttr('falseList', rightList[0].getAttr('falseList').concat(rightList[3].getAttr('falseList')));
        leftSymbol.setAttr('trueList', rightList[3].getAttr('trueList'));
      },
    },
    {
      generatorRight: '<Boolean-exp> OR <M> <Boolean-exp>',
      generatorFunction: function (leftSymbol, rightList) {
        codeList.backPatch(rightList[0].getAttr('falseList'), rightList[2].getAttr('instr'));
        leftSymbol.setAttr('trueList', rightList[0].getAttr('trueList').concat(rightList[3].getAttr('trueList')));
        leftSymbol.setAttr('falseList', rightList[3].getAttr('falseList'));
      },
    },
    {
      generatorRight: 'NOT <Boolean-exp>',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('trueList', rightList[1].getAttr('falseList'));
        leftSymbol.setAttr('falseList', rightList[1].getAttr('trueList'));
      },
    },
    {
      generatorRight: 'TRUE',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('trueList', [codeList.getNextLineCode()]);
        codeList.genCode(Code.OP.GOTO, null, null, null);
      },
    },
    {
      generatorRight: 'FALSE',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('falseList', [codeList.getNextLineCode()]);
        codeList.genCode(Code.OP.GOTO, null, null, null);
      },
    },
    {
      generatorRight: 'LR_BRAC <Boolean-exp> RR_BRAC',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('trueList', rightList[1].getAttr('trueList'));
        leftSymbol.setAttr('falseList', rightList[1].getAttr('falseList'));
      },
    },
    {
      generatorRight: '<Expression> <Relation> <Expression>',
      generatorFunction: function (leftSymbol, rightList) {
        leftSymbol.setAttr('trueList', [codeList.getNextLineCode()]);
        leftSymbol.setAttr('falseList', [codeList.getNextLineCode() + 1]);
        codeList.genCode(rightList[1].getAttr('op'), rightList[0].getAttr('addr'), rightList[2].getAttr('addr'), null);
        codeList.genCode(Code.OP.GOTO, null, null, null);
      },
    },
  ],
  '<Relation>': [// <Relation>.op = Code.OP. EQ | LT | ....
    {
      generatorRight: 'EQ',// ==
      generatorFunction: boolExpression.relation(Code.OP.EQ),
    },
    {
      generatorRight: 'LT',// <
      generatorFunction: boolExpression.relation(Code.OP.LT),
    },
    {
      generatorRight: 'GT',// >
      generatorFunction: boolExpression.relation(Code.OP.GT),
    },
    {
      generatorRight: 'LE',// <=
      generatorFunction: boolExpression.relation(Code.OP.LE),
    },
    {
      generatorRight: 'GE',// >=
      generatorFunction: boolExpression.relation(Code.OP.GE),
    },
    {
      generatorRight: 'NE',// <>
      generatorFunction: boolExpression.relation(Code.OP.NE),
    },
  ],
};

module.exports = gramma;

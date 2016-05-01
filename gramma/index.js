/**
 * Created by liu on 16/4/23.
 */

'use strict';
const sheet = require('../identifierSheet');
const IDSheet = require('../identifierSheet/identifierSheet');

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
      generatorRight: '<Const-decl> <Var-decl> <Proc-decl> <Body>',
    },
  ],
  '<Const-decl>': [
    {
      generatorRight: '',
    }
  ],
  //<editor-fold desc='变量声明语句块，对外接口<Var-decl>'>
  '<Var-decl>': [
    {
      generatorRight: '',
    },
    {
      generatorRight: 'VAR <Var-decl-list>',
      generatorFunction: function(leftSymbol, rightList) {
        // 这里装入符号表
        sheet.push(rightList[1].getAttr('iDSheet'));
      },
    },
  ],
  '<Var-decl-list>': [
    {
      generatorRight: '<Var-ids> COLON <Var-type> SEMIC <Var-decl-list>',
      generatorFunction: function(leftSymbol, rightList) {
        // 这里注册符号表
        let idSheet = rightList[4].getAttr('iDSheet') ? rightList[4].getAttr('iDSheet') : new IDSheet();
        leftSymbol.setAttr('iDSheet', idSheet);
        for (let id of rightList[0].getAttr('ids')) {
          idSheet.register(id, rightList[2].attr);
        }
      },
    },
    {
      generatorRight: '',
    },
  ],
  '<Var-ids>': [
    {
      generatorRight: '<Var-ids> COMMA ID',
      generatorFunction: function(leftSymbol, rightList) {
        const list = rightList[0].getAttr('ids');
        list.push(rightList[2].getAttr('value'));
        leftSymbol.setAttr('ids',list);
      },
    },
    {
      generatorRight: 'ID',
      generatorFunction: function(leftSymbol, rightList) {
        leftSymbol.setAttr('ids', [rightList[0].getAttr('value')]);
      },
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
      generatorFunction: function (leftSymbol, rightList) {
        const start = parseInt(rightList[2].getAttr('value'));
        const end = parseInt(rightList[4].getAttr('value'));
        if (end < start) throw '数组元素索引范围有误。';
        leftSymbol.setAttr('type', 'ARRAY ' + rightList[7].getAttr('type') + ' ' + start + ' ' + end);
        leftSymbol.setAttr('space', rightList[7].getAttr('space') * (end - start + 1));
      }
    },
    {
      generatorRight: 'ARRAY LS_BRAC REAL_EXP DOT INT_EXP RS_BRAC OF <Var-basic-type>',
      generatorFunction: function (leftSymbol, rightList) {
        const start = parseInt(rightList[2].getAttr('value'));
        const end = parseInt(rightList[4].getAttr('value'));
        if (end < start) throw '数组元素索引范围有误。';
        leftSymbol.setAttr('type', 'ARRAY ' + rightList[7].getAttr('type') + ' ' + start + ' ' + end);
        leftSymbol.setAttr('space', rightList[7].getAttr('space') * (end - start + 1));
      }
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
    }
  ],
  //</editor-fold>

  '<Body>': [
    {
      generatorRight: 'BEGIN <Statement-list> END F_STOP',
    },
    {
      generatorRight: '<Statement>',
    },
  ],
  '<Statement-list>': [
    {
      generatorRight: '<Statement> SEMIC <Statement-list>',
    },
    {
      generatorRight: '',
    }
  ],
  '<Statement>': [
    {
      generatorRight: '', //空语句
    },
    {
      generatorRight: 'ID LR_BRAC <Expression> RR_BRAC',//函数调用，todo 多参数
    },
    {
      generatorRight: '<Left> ASSIGN <Expression>',//赋值语句
    },
    {
      generatorRight: 'IF <Boolean-expression> THEN <Body>',//IF 语句
    },
  ],
  //<editor-fold desc='左值'>
  '<Left>': [
    {
      generatorRight: 'ID',
    },
    {
      generatorRight: 'ID LS_BRAC <Number-expression> RS_BRAC',
    }
  ],
  //</editor-fold>
  '<Number-expression>': [ // todo: 索引运算，目前只支持变量和常数
    {
      generatorRight: 'ID',
    },
    {
      generatorRight: 'INT_EXP',
    },
  ],
  '<Expression>': [
    {
      generatorRight: 'STRING_EXP',
    }
  ],
  '<Boolean-expression>': [
    {
      generatorRight: 'ID',
    },
  ],
};

module.exports = gramma;

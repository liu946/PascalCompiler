/**
 * Created by liu on 16/4/23.
 */

'use strict';

const codeList = require('../threeAddressCode');
const Code = require('../threeAddressCode/code');
const Definition = require('./definition');
const grammaFunction = require('./grammaFunction');
const sheet = require('../identifierSheet');

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
      generatorRight: '<Function-call>',//函数调用，todo 多参数
    },
    {
      generatorRight: 'ID ASSIGN <Expression>',//赋值语句 id = ???
      generatorFunction: function (leftSymbol, rightList) {
        if (rightList[2].getAttr('code')) {
          rightList[2].getAttr('code').changeResult(rightList[0].getAttr('addr'));
        } else {
          codeList.genCode(Code.OP.ASSIGN, rightList[2].getAttr('addr'), null, rightList[0].getAttr('value'));
        }
      },
    },
    {
      generatorRight: '<Array-exp> ASSIGN <Expression>',//赋值语句 a[1] = ???
      generatorFunction: function (leftSymbol, rightList) {
        codeList.genCode(Code.OP.AASSIGN,
          rightList[0].getAttr('offset'),
          rightList[2].getAttr('addr'),
          rightList[0].getAttr('baseAddr'));
      },
    },
    {
      generatorRight: 'IF <Boolean-expression> THEN <Body>',//IF 语句
    },
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
    {
      generatorRight: '<Function-call>',
    },
  ],
  '<Function-call>': [
    {
      generatorRight: 'ID LR_BRAC <Expression> RR_BRAC',
    }
  ],
  '<Boolean-expression>': [
    {
      generatorRight: 'ID',
    },
  ],
};

module.exports = gramma;

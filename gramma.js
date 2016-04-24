/**
 * Created by liu on 16/4/23.
 */

'use strict';

const noOption = function(leftSymbol, rightList) {
  console.log('[REDUCE] ' + leftSymbol.toString() + ' => ' + rightList.map((x)=>x.toString()).join(' '));
  // 可以执行如下指令
  // leftSymbol.setAttr(key,val);
  // rightList[0].getAttr(key);
};

const gramma = {
  '<Program>': [
    {
      generatorRight : 'PROGRAM ID SEMIC <Block>',
      generatorFunction : noOption,
    },
  ],
  '<Block>': [
    {
      generatorRight : '<Const-decl> <Var-decl> <Proc-decl> <Body>',
      generatorFunction : noOption,
    },
  ],
  '<Const-decl>': [
    {
      generatorRight: '',
      generatorFunction : noOption,
    }
  ],
  '<Var-decl>': [
    {
      generatorRight: '',
      generatorFunction : noOption,
    },
    {
      generatorRight: 'VAR <Var-decl-list>',
      generatorFunction : noOption,
    }
  ],
  '<Var-decl-list>': [
    {
      generatorRight: '<Var-ids> COLON <Var-type> SEMIC <Var-decl-list>',
      generatorFunction : noOption,
    },
    {
      generatorRight: '',
      generatorFunction : noOption,
    }
  ],
  '<Var-ids>': [
    {
      generatorRight: '<Var-ids> COMMA ID',
      generatorFunction : noOption,
    },
    {
      generatorRight: 'ID',
      generatorFunction : noOption,
    },
  ],
  '<Var-type>': [
    {
      generatorRight: 'INTEGER',
      generatorFunction : noOption,
    },
    {
      generatorRight: 'REAL',
      generatorFunction : noOption,
    },
    {
      generatorRight: 'CHAR',
      generatorFunction : noOption,
    },
    {
      generatorRight: 'BOOLEAN',
      generatorFunction : noOption,
    },
    {
      generatorRight: 'STRING',
      generatorFunction : noOption,
    },
  ],
  '<Proc-decl>':  [
    {
      generatorRight: '',
      generatorFunction : noOption,
    }
  ],
  '<Body>': [
    {
      generatorRight: 'BEGIN <Statement-list> END F_STOP',
      generatorFunction: noOption,
    },
  ],
  '<Statement-list>': [
    {
      generatorRight: '<Statement>',
      generatorFunction: noOption,
    },
    {
      generatorRight: '<Statement-list> SEMIC <Statement>',
      generatorFunction: noOption,
    }
  ],
  '<Statement>':  [
    {
      generatorRight: 'ID LR_BRAC <Expression> RR_BRAC',//函数调用，todo 多参数
      generatorFunction: noOption,
    },
  ],
  '<Expression>': [
    {
      generatorRight: 'STRING',
      generatorFunction: noOption,
    }
  ],
};

module.exports = gramma;

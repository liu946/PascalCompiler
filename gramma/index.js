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
  //<editor-fold desc='变量声明语句块，对外接口<Var-decl>'>
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
  //</editor-fold>

  //<editor-fold desc='子过程声明语句块，对外接口<Proc-decl>'>

  '<Proc-decl>':  [
    {
      generatorRight: '',
      generatorFunction : noOption,
    }
  ],
  //</editor-fold>

  '<Body>': [
    {
      generatorRight: 'BEGIN <Statement-list> END F_STOP',
      generatorFunction: noOption,
    },
  ],
  '<Statement-list>': [
    {
      generatorRight: '<Statement> SEMIC <Statement-list>',
      generatorFunction: noOption,
    },
    {
      generatorRight: '',
      generatorFunction: noOption,
    }
  ],
  '<Statement>':  [
    {
      generatorRight: '', //空语句
      generatorFunction: noOption,
    },
    {
      generatorRight: 'ID LR_BRAC <Expression> RR_BRAC',//函数调用，todo 多参数
      generatorFunction: noOption,
    },
    {
      generatorRight: '<Left> ASSIGN <Expression>',//赋值语句
      generatorFunction: noOption,
    },
  ],
  //<editor-fold desc='左值'>
  '<Left>': [
    {
      generatorRight: 'ID',
      generatorFunction: noOption,
    },
    {
      generatorRight: 'ID LS_BRAC <Number-expression> RS_BRAC',
      generatorFunction: noOption,
    }
  ],
  //</editor-fold>
  '<Number-expression>': [ // todo: 增加运算，目前只支持变量和常数
    {
      generatorRight: 'ID',
      generatorFunction: noOption,
    },
    {
      generatorRight: 'INT_EXP',
      generatorFunction: noOption,
    },
  ],
  '<Expression>': [
    {
      generatorRight: 'STRING_EXP',
      generatorFunction: noOption,
    }
  ],
};

module.exports = gramma;

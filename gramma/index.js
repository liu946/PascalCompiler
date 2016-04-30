/**
 * Created by liu on 16/4/23.
 */

'use strict';


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
    }
  ],
  '<Var-decl-list>': [
    {
      generatorRight: '<Var-ids> COLON <Var-type> SEMIC <Var-decl-list>',
    },
    {
      generatorRight: '',
    }
  ],
  '<Var-ids>': [
    {
      generatorRight: '<Var-ids> COMMA ID',
    },
    {
      generatorRight: 'ID',
    },
  ],
  '<Var-type>': [
    {
      generatorRight: '<Var-basic-type>',
    },
    {
      generatorRight: '<Array-type>',
    }
  ],
  '<Array-type>' : [
    {
      generatorRight: 'ARRAY LS_BRAC INT_EXP RANGE INT_EXP RS_BRAC OF <Var-basic-type>',
    },
  ],
  '<Var-basic-type>': [
    {
      generatorRight: 'INTEGER',
    },
    {
      generatorRight: 'REAL',
    },
    {
      generatorRight: 'CHAR',
    },
    {
      generatorRight: 'BOOLEAN',
    },
    {
      generatorRight: 'STRING',
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

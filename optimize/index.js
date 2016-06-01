/**
 * Created by liu on 16/5/19.
 */

'use strict';
const Block = require('./codeBlock');
const OP = require('../threeAddressCode/code').OP;
const CodeGenerator = require('../targetCode').generator;
const IDSheet = require('../identifierSheet');
const labelConstructor = require('../gramma/tempGenerator')('L_');
const constStrignConstructor = require('../gramma/tempGenerator')('STR_');

const JmpCode = [OP.GOTO, OP.GE, OP.EQ, OP.GT, OP.LE, OP.LT, OP.NE];
class Optimizer {
  constructor() {
    this.startLineOfBlock = {};
    this.preCompileCodeGen = new CodeGenerator();
  }

  init(codeList) {
    this.originCodeList = codeList;
    this.codeList = this.originCodeList.map((x) => x);
    this.codeBlocks = this.cutBlocks();
    this.optimizeTempVar();
    this.tempAlloc();
  }

  toString() {
    return this.codeBlocks.map((x) => x.toString()).join('\n\n');
  }

  
  // 为中间变量分配符号表内存
  tempAlloc() {
    for (let codeIndex = 0; codeIndex < this.codeList.length; codeIndex++) {
      const code = this.codeList[codeIndex];
      if (code.result && code.result.toString().substr(0, 4) === 'tmp_') {
        // 使用a1的类型
        // 这里是一个简单的处理
        // todo 类型判断
        IDSheet.register(code.result.toString(), {"type": "INTEGER", "space": 4});
      }
    }
  }
  
  //
  /**
   * 用于简化代码中间变量使用数量
   * @info:
   * 1. 去掉无用的二次计算变量
   * 2. 记录每一个中间变量的起始和终止地址
   * 3. 对于存在终止地址小于起始地址的,就将后面的变量命名为前面的变量
   *    这里因为三地址码分块处理,由编译方式,块之间不存在中间变量,使用一个简单的实现
   *    每一块重新计数,使用中间变量即可.
   */
  optimizeTempVar() {
    // 去掉无用的二次计算变量
    this.codeBlocks.map(function (x) {
      x.optimizeTempVar();
    });

  }

  print() {
    return this.codeBlocks.map((x) => {x.print(); console.log('\n\n')});
  }

  cutBlocks() {

    // 首先确定所有的入口(leader)语句
    let leaderCodeIndexList = [0];
    let jmpInto = {};
    for (let codeIndex = 0; codeIndex < this.codeList.length; codeIndex++) {
      const code = this.codeList[codeIndex];
      if (JmpCode.indexOf(code.op ) !== -1) {
        if (leaderCodeIndexList.indexOf(code.result - 1) === -1) {
          leaderCodeIndexList.push(code.result - 1);
          jmpInto[code.result.toString()] = true;
        }
        if (leaderCodeIndexList.indexOf(codeIndex + 1) === -1) {
          leaderCodeIndexList.push(codeIndex + 1);
        }
      }
    }
    leaderCodeIndexList.sort((a, b) => a - b);

    // 对于每个入口语句，其基本块由它和直到下一个入口语句(但不含该入口语句)或程序结束为止的所有语句组成。
    leaderCodeIndexList.push(this.codeList.length);
    const codeBlocks = [];
    const codeListCopy = this.codeList.map((x) => x);
    while (leaderCodeIndexList.length - 1) {
      codeBlocks.push(new Block(codeListCopy.splice(0, leaderCodeIndexList[1] - leaderCodeIndexList[0])));
      leaderCodeIndexList.shift();
    }
    // 统计原始开始行数
    for (let i = 0; i < codeBlocks.length; i++ ) {
      this.startLineOfBlock[codeBlocks[i].originStartLine] = codeBlocks[i];
      codeBlocks[i].getBlockWithLineCode = this.startLineOfBlock;
      if (jmpInto[codeBlocks[i].originStartLine]) {
        codeBlocks[i].label = labelConstructor.newTemp();
      }
    }
    
    return codeBlocks;
  }

  _preCompile() {
    this.preCompileCodeGen.gen(".386");
    this.preCompileCodeGen.gen("  .model flat, stdcall");
    this.preCompileCodeGen.gen("  .stack 2048");
    this.preCompileCodeGen.gen("option casemap : none");

    this.preCompileCodeGen.gen("includelib	\"C:\\Users\\liu\\Documents\\nasm\\msvcrt.lib\"");

    // exports
    this.preCompileCodeGen.gen("printf		proto c : ptr byte, : vararg");
    this.preCompileCodeGen.gen("scanf		  proto c : ptr byte, : vararg");
    this.preCompileCodeGen.gen("_getche		proto c");
    this.preCompileCodeGen.gen("ExitProcess 	proto : dword ");

    // data section
    this.preCompileCodeGen.gen(".data");
    // const string
    const strMap = IDSheet.getConstStrMap();
    for (let strName in strMap) {
      this.preCompileCodeGen.gen(strName + " db " + strMap[strName].replace(/\\n/g, '", 10, "').replace(', ""', '') + ", 0");
    }
    // var
    const idSheetMap = IDSheet.getIdSheetMap();
    const wordSize = {1: 'db', 2: 'dw', 4: 'dword'};
    for (let id in idSheetMap) {
      if (idSheetMap[id].getAttr('type').substr(0, 5) === 'ARRAY') {
        this.preCompileCodeGen.gen(
          id + ' ' + wordSize[idSheetMap[id].getAttr('baseTypeSpace')] + ' ' +
          parseInt(idSheetMap[id].getAttr('space') / idSheetMap[id].getAttr('baseTypeSpace'))
          + ' dup(0) ');
      } else {
        this.preCompileCodeGen.gen(id + ' ' + wordSize[idSheetMap[id].getAttr('space')] + ' 0');
      }
    }

    this.preCompileCodeGen.gen(".code");
    this.preCompileCodeGen.gen('	main	proc');
  }

  compile() {
    this._preCompile();
    this.codeBlocks.map((x) => x.compile(IDSheet));
  }

  getCode() {
    let codeString = this.preCompileCodeGen.codeList.map((x) => x.toString()).join('\n');
    codeString += '\n';
    codeString += this.codeBlocks.map((x) => x.getCode()).join('\n');
    return codeString;
  }

}

module.exports = new Optimizer();

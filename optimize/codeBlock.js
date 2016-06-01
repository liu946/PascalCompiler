/**
 * Created by liu on 16/5/19.
 */
'use strict';
const labelConstructor = require('../gramma/tempGenerator')('L_');
const registerAllocer = require('../targetCode/registerAllocer');
const targetCode = require('../targetCode');
const CodeGenerator = require('../targetCode').generator;
const OP = require('../threeAddressCode/code').OP;
const JMPCMDLIST = [OP.GOTO, OP.GE, OP.EQ, OP.GT, OP.LE, OP.LT, OP.NE];

const idSheet = require('../identifierSheet');
class Block {
  constructor(codeList) {
    this.codeList = codeList;
    this.originStartLine = this.codeList[0].label;
    this.label = '';
    this.attr = {};
    this.liveList = [];
    this.targetCodeGenerator = new CodeGenerator();
    // this.nextBlock = null;
    this.getBlockWithLineCode = null; // 等待外层填入
    // 这里放弃使用活动变量的寄存器分配方式
    // this.collectLive();
    // const regRecord = {};
    // this.regRecord = regRecord;
    // this.liveList.map(function (x) {
    //   regRecord[x] = ['MEM'];
    // })
  }

  optimizeTempVar() {
    this._removeTmpReCalulated();
  }

  _removeTmpReCalulated() {
    const store = {};
    for (let codeIndex = 0; codeIndex < this.codeList.length; codeIndex++) {
      const code = this.codeList[codeIndex];
      if ([OP.MUL, OP.ADD].indexOf(code.op) !== -1 && code.result.toString().substr(0, 4) === 'tmp_') {
        if (store[code.getRight()] && store[code.getRight()].name !== code.result.name) {
          code.result.name = store[code.getRight()].name;
          code.removed = true;
          return this._removeTmpReCalulated();
        } else {
          store[code.getRight()] = code.result;
        }
      }
    }
  }

  getCode() {
    return (this.label ? (this.label + ':') : '\t')
    + '\t' + this.targetCodeGenerator.codeList.map((x) => x.toString()).join('\n\t\t');
  }

  _compileCode(code) {
    return targetCode.compile(code);
  }

  /**
   * 由可以进入的其他模块调用进入编译,传入是否需要建立标签
   * 
   * 寄存器的分配方式如下
   * 1. 每个块之间不存在寄存器变量传递,进入一块时所有变量都存在内存中.
   * 2. 出块之前所有变量都要写回内存.
   * 
   * 一个更好的但是没有实现的方式:
   * 跨块调整
   * @param identifierSheet {Object}
   * @param isJmpInto {boolean}
   */
  compile(identifierSheet) {
    targetCode.setCodeGenerator(this.targetCodeGenerator);
    for (let threeAddrCodeIndex = 0; threeAddrCodeIndex < this.codeList.length; threeAddrCodeIndex++) {
      const code = this.codeList[threeAddrCodeIndex];
      // 优化删除的语句跳过
      if (code.removed)
        continue;

      // 遇到跳转指令就根据当前的符号表去编译下一块
      // 并结束本块的翻译,跳出循环,因为跳转一定是本块的最后一句
      if (-1 !== JMPCMDLIST.indexOf(code.op)) {
        this.writeBack();
        code.result = this.getBlockWithLineCode[code.result].label;
        this._compileCode(code);
        this.flushReg();
        return;
      } else if (code.op == OP.CALL) {
        this.writeBack();
        this._compileCode(code);
        this.flushReg();
      } else {
        this._compileCode(code);
      }
    }
    // 回写,刷新寄存器
    this.flushReg();
  }

  flushReg() {
    registerAllocer.flushReg();
  }
  
  writeBack() {
    idSheet.writeBack();
  }
  /**
   * @unused 此设计没有被采用
   * 记录进入时刻的符号表状态
   * (这里只记录了所有变量的值,临时变量没有记录,我们认为临时变量是不跨块的,
   * 虽然三地址码可以这么做,但是通过编译生成的代码中没有)
   * 如果是第二个进入此块的代码,需先将使用的变量设置为相同状态
   * @param identifierSheet
   */
  recordIdentifierStats(identifierSheet) {
    this.idSheet = {};
    for (let id of identifierSheet) {
      if (!id.isTemp()) {
        this.idSheet[id] = identifierSheet[id].in.map((x) => x);
      }
    }
  }

  getAttr(key) {
    return this.attr[key];
  }

  setAttr(key, value) {
    this.attr[key] = value;
  }

  toString() {
    return this.codeList.map((x)=> x.toString()).join('\n');
  }

  print() {
    console.log(this.toString());
    // console.log('>>>>>> 活动变量 <<<<<<');
    // console.log(JSON.stringify(this.liveList));
    console.log('>>>>>> 目标代码 <<<<<<');
    console.log(this.targetCodeGenerator.toString());
  }

  collectLive() {
    this.genericList = {};
    this.liveList = [];
    for (let codeIndex = 0; codeIndex < this.codeList.length; codeIndex++) {
      const code = this.codeList[codeIndex];
      this._collectLiveVar(code.a1);
      this._collectLiveVar(code.a2);
      this.genericList[code.result] = true;
    }
  }
  
  _collectLiveVar(name) {
    if (!name || !isNaN(parseInt(name)))
      return;
    if (!this.genericList[name]) {
      this.liveList.push(name);
      this.genericList[name] = true;
    }
  }
}
  


module.exports = Block;

/**
 * Created by liu on 16/5/17.
 */
'use strict';
const sheet = require('../identifierSheet');
const targetCode = require('../targetCode');
// 日志:
// 操作表和申请操作在哪个类完成
// 1. 切换reg (reg负责通知reg保存的identifier回写)
// 2. block退出时回写 (通知IDSheet,将所有变量回写)
/**
 * Register 类
 * 
 */
class Register {
  constructor(name) {
    this.name = name;
    this.idList = [];
  }

  addIn(id) {
    if (this.idList.indexOf(id) === -1)
      this.idList.push(id);
  }

  setIn(id) {
    if (id) {
      this.idList = [id];
    } else {
      this.idList = [];
    }
  }

  load(id) {
    if (typeof (id) === 'string') {
      id = sheet.getDescribe(id);
    }
    // 如果就在列表里面,就不用处理了
    if (this.idList.indexOf(id) !== -1) {
      return;
    }
    // 如果没有未使用的,需要回写
    this.writeBack();
    // 分配, 双向
    this.idList = [id];
    targetCode.getGenerator().gen('MOV ' + this.name + ', ' + id.addressString());
    id.addIn(this);
  }

  /**
   * 回写全部的变量
   */
  writeBack() {
    for (let i = 0; i < this.idList.length; i++) {
      if (typeof (this.idList[i]) === 'string' )
        sheet.getDescribe(this.idList[i]).writeBack();
      else
        this.idList[i].writeBack();
    }
  }
  
  toString() {
    return this.name;
  }
}


/**
 * 数据结构
 * regList : ['eax', 'ebx', 'ecx', 'edx']
 * regMap : {'eax', 'ebx', 'ecx', 'edx': register}
 */
class RegisterAllocer {
  constructor(regList) {
    this.regList = regList.map((x) => new Register(x)); 
    this.regUsedOrder = regList.map((x) => x);
    this.liveList = [];
    this.regMap = {};
    for (let i = 0; i < this.regList.length; i++) {
      this.regMap[this.regList[i]] = this.regList[i];
    }
  }

  flushReg() {
    this.regList.map(function (x) {
      x.writeBack();
      x.idList.map(function (id) {
        sheet.getDescribe(id.name).setIn('MEM');
      });
      x.setIn();
    });
  }

  /**
   * 得到最早使用的reg
   */
  getFirstUsedReg() {
    return this.regUsedOrder[0];
  }
  
  recordUsedReg(reg) {
    this.regUsedOrder.splice(this.regUsedOrder.indexOf(reg), 1);
    this.regUsedOrder.push(reg);
  }
  
  allocRegister(varName, reg) {
    reg = reg ? reg.toString() : this.getFirstUsedReg();
    if (this.regMap[reg].idList.indexOf(varName.toString()) !== -1) {
      // 如果本身就在,直接返回
      return this.regMap[reg];
    }
    this.regMap[reg].load(varName);
    this.recordUsedReg(reg);
    return this.regMap[reg];
  }

  getBlankReg() {
    const reg = this.getFirstUsedReg();
    if (this.regMap[reg].idList.length) {
      this.regMap[reg].writeBack();
      this.regMap[reg].idList.map(function (id) {
        sheet.getDescribe(id.name).setIn('MEM');
      });
      this.regMap[reg].setIn();
    } else {
      return this.regMap[reg];
    }
  }

}

module.exports = new RegisterAllocer(['EAX', 'EBX', 'ECX', 'EDX']);

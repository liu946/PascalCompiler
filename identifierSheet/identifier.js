/**
 * Created by liu on 16/5/3.
 */
'use strict';
const regAllocer = require('../targetCode/registerAllocer');
const targetCode = require('../targetCode');
class Identifier {
  /**
   *
   * @param attr
   * @param address
   * @param name
   * @param type 这里的type是 标识符的类型，function, var, record
   */
  constructor (attr, address, name, type) {
    this.attr = attr;
    this.address = address;
    this.name = name;
    this.type = type ? type : 'var';
    this.in = ['MEM']; // 变量所在的位置,'MEM'在内存中
  }

  getAttr(key) {
    return this.attr[key];
  }

  setAttr(key, value) {
    this.attr[key] = value;
  }

  addressString() {
    return '' + this.name + '';//this.name;//(' + this.name + ')';
  }

  /**
   * 如果不在内存中则回写
   */
  writeBack() {
    if (this.in.length !== 0 && this.in.indexOf('MEM') === -1) {
      // genCode MOV this.address, this.in[0];
      targetCode.getGenerator().gen('MOV ' + this.addressString() + ', ' + this.in[0].toString());
      this.in.push('MEM');
    }
  }

  /**
   * 直接设置in数组
   * 用于变量是result
   * @param reg
   */
  setIn(reg) {
    this.in = [reg];
  }

  /**
   * 增加一个所在位置,
   * 用于将变量装入内存时
   * @param reg
   */
  addIn(reg) {
    if (this.in.indexOf(reg) === -1)
      this.in.push(reg);
  }

  /**
   * 删除一个变量的某个寄存器引用
   * 用于 a = b + c :eax = b,add eax, c.addr, 后b摘除eax引用的状况
   * @param reg
   */
  removeIn(reg) {
    if (this.in.indexOf(reg) !== -1)
      this.in.splice(this.in.indexOf(reg), 1);
  }

  /**
   * 此函数组是关键函数
   * 返回varName的
   *  寄存器(没有自动申请)
   *  寄存器或内存(可以返回i,这样的内存变量,或者返回[ebp+addr])
   */
  getVarByReg() {
    let reg = this.inReg();
    if (reg) {
      return reg;
    } else {
      return this.allocRegister();
    }
  }

  allocRegister(regName) {
    return regAllocer.allocRegister(this.name, regName);
  }

  getVarByMemOrReg() {
    let reg = this.inReg();
    if (reg) {
      return reg;
    } else {
      return this.addressString();
    }
  }

  /**
   * 返回所在的寄存器或者false
   * @returns {*}
   */
  inReg() {
    for (let i = 0; i < this.in.length; i++) {
      if (this.in[i] !== 'MEM') {
        return this.in[i];
      }
    }
    return false;
  }

  toString () {
    return (this.name ? this.name : "$" + this.address) + ' ' +
      this.address + ' ' +
      this.attr.type + '(' + this.attr.space + ')';
  }
}

module.exports = Identifier;

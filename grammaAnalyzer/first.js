/**
 * Created by liu on 16/4/16.
 */
'use strict';
const gramma = require('./gramma');

function isFinal(string) {
  return string[0]!=='<';
}

class First {
  constructor() {
    this.gramma = gramma;
    this.first = {};
    while(this.init());
  }

  init() {
    for(let left in this.gramma){
      this.checkAndInsert(left);
      if (this.gramma[left].indexOf('') !== -1) {
        // 3. 空产生式在其中，应该将空产生式加入First(x);
        if(this.addingIfNotExist(left, '')) return true;
      }
      for (let right of this.gramma[left]) {
        // 2.
        let symbolList = right.split(' ');
        for (let symbol of symbolList) {this.checkAndInsert(symbol);}
        for (let symbolIndex = 0; symbolIndex < symbolList.length; symbolIndex++) {
          if (this.addingSetIfNotExist(left, this.first[symbolList[symbolIndex]])) return true; // 更新成功
          if (this.first[symbolList[symbolIndex]].indexOf('') === -1) break;
          if (symbolIndex === symbolList.length - 1) {
            // 所有生成符号都可以生成空，将空放入First集合
            if(this.addingIfNotExist(left, '')) return true;
          }
        }
      }
    }
    return false; // 没有再插入元素，First集合初始化完成
  }

  addingSetIfNotExist(symbol, finalSymbolSet) {
    let ifInsert = false;
    for (let finalSymbol of finalSymbolSet) {
      ifInsert |= this.addingIfNotExist(symbol, finalSymbol);
    }
    return ifInsert;
  }

  addingIfNotExist(symbol, finalSymbol) {
    if (this.first[symbol].indexOf(finalSymbol) !== -1) {
      return false; // 已存在，插入失败
    } else {
      this.first[symbol].push(finalSymbol);
      return true;
    }
  }

  checkAndInsert(symbol) {
    if(!this.first[symbol]) {
      this.first[symbol] = [];
      if (isFinal(symbol)) {
        this.first[symbol].push(symbol);
      }
    }
  }

  toString() {
    let string = '';
    for (let symbol in this.first) {
      string += (symbol + this.first[symbol].join(',') + '\n');
    }
  }

}

module.exports = First;
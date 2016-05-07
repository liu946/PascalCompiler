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

  getFirst(item, generatorForward) {
    let list = this._getFirstReduce(item.gramma.right, item.dot + 1);
    if (list.indexOf('') === -1) {
      // 非可空生成式
      return list;
    } else {
      // 将list放在前面就可以将list中的空产生式去除
      return First.combineSet(list, generatorForward);
    }
  }

  _getFirstReduce(productList, dotNext) {
    if (productList.length === dotNext) {
      // 没有匹配的字符了。beta === ''
      return [''];
    }

    if (productList[dotNext] in this.first) {
      let first = this.first[productList[dotNext]];
      if (first.indexOf('') === -1) {
        // 没有空产生式
        return first;
      } else {
        // 有空产生式，需要加上之后的产生式
        return First.combineSet(first, this._getFirstReduce(productList, dotNext + 1));
      }
    }
  }
}


/**
 * 合并两个数组，没有重复元素，去掉第一个数组中的空产生式
 * @param arr1
 * @param arr2
 * @returns {Array<string>}
 * @static
 * @classMethod
 */
First.combineSet = function(arr1, arr2) {
  let setArr = {};
  let rec = [];
  arr1.map(function(x) {
    if (x!=='') {
      setArr[x] = true;
      rec.push(x);
    }
  });
  let arr2copy = [];
  arr2.map(function(x) {
    // 第二个map中可以包含‘’产生式，这个产生式用于判断是否将发生闭包运算的原始生成式的forward集合引入进来。
    if (setArr[x] === undefined) arr2copy.push(x);
  });
  return rec.concat(arr2copy);
};

module.exports = First;
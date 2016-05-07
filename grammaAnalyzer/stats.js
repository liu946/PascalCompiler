/**
 * Created by liu on 16/4/19.
 */
'use strict';

const gramma = require('./gramma');
const md5 = require('md5');
const First = require('./first');
const firstSet = new First();
const Item = require('./item');
const isFinal = require('./util').isFinal;

class Stats {
  constructor() {
    this.itemList = [];
    this.goto = {};
    this.action = {};
    return this;
  }

  /**
   * 构成DFA的边，但同时也要更新action
   * @param symbol
   * @param stats
   */
  setGoto(symbol, stats) {
    this.goto[symbol] = stats;
    if (isFinal(symbol)) {
      this.action[symbol] = {action:'shift', stats: stats};
    }
  }

  setAction(item) {
    if (item.gramma.left === '<Start>' && item.dot === 1) {
      this.action['$'] = {action:'acc'};
    } else if (item.dot === item.gramma.right.length) {
      for (let symbol of item.forwordSet) {
        this.action[symbol] = {action: 'reduce', gramma: item.gramma};
      }
    }
  }

  pushItem(item) {
    this.itemList.push(item);
  }

  toString() {
    return this.itemList.sort((a,b) => a.toString() > b.toString()).map((x) => x.toString()).join('\n');
  }

  getHash() {
    if (this.hash === undefined) {
      this.hash = md5(this.toString());
    }
    return this.hash;
  }

  /**
   * 同时新加入item时，也要更新action表
   */
  closure() {
    if (this.itemList.length < 1) throw 'unInit error';
    let unClosureList = this.itemList.map((x)=>x); // copy

    // 归约相同产生式而forwordSet不同的item，这里需要一起操作，使得不会出现递归定义
    let formulaSet = {};
    formulaSet[this.itemList[0].formulaString()] = this.itemList[0];

    while (unClosureList.length) {
      let item = unClosureList.shift();
      if (item.gramma.right[item.dot] !== undefined && !isFinal(item.gramma.right[item.dot])) {
        // 非终结符
        let symbolNextToDot = item.gramma.right[item.dot];
        for (let generateRight of gramma[symbolNextToDot]) {
          let newItem = new Item(symbolNextToDot, generateRight, firstSet.getFirst(item, item.forwordSet));
          // 这里注意处理，是更新原来的item的forwardSet还是新加入一个item
          let formula = newItem.formulaString();
          if (formulaSet[formula] === undefined) {
            formulaSet[formula] = newItem;
            this.itemList.push(newItem);
            unClosureList.push(newItem);
          } else {
            // 如果这个表达式已经存在，那么应该只做合并forward集合合并操作// 此时应该检查是否会重复
            formulaSet[formula].forwordSet = First.combineSet(formulaSet[formula].forwordSet, newItem.forwordSet);
          }
        }
      }
    }
    for (let item of this.itemList) {
      // 这里更新action表
      this.setAction(item);
    }
  };

  print() {
    let str = '>>> Stats : ' + this.getHash() + ' <<<\n';
    str += this.toString();
    str += '\n---------------------------\n';
    for(let key in this.goto) {
      str += (key + ' => ' + this.goto[key].getHash() + '\n');
    }
    str += '---------------------------\n';
    for(let key in this.action) {
      str += (key + ' => ' + this.action[key].action + '\n');
    }
    console.log(str);
  }
}

module.exports = Stats;
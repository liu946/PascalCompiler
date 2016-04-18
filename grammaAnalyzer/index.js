/**
 * Created by liu on 16/4/10.
 */
'use strict';

const gramma = require('./gramma');
const md5 = require('md5');
const First = require('./first');
const firstSet = new First();
const Item = require('./item');

function isFinal(string) {
  return string[0]!=='<';
}

class Stats {
  constructor() {
    this.itemList = [];
    this.goto = {};
    return this;
  }

  setGoto(symbol, stats) {
    this.goto[symbol] = stats;
  }

  pushItem(item) {
    this.itemList.push(item);
  }

  toString() {
    return this.itemList.sort((a,b) => a.toString() > b.toString()).map((x) => x.toString()).join('\n');
  }

  getHash() {
    return md5(this.toString());
  }

  closure() {
    if (this.itemList.length !== 1) throw 'unInit error';
    let unClosureList = [this.itemList[0]];
    while (unClosureList.length) {
      let item = unClosureList.shift();
      if (item.gramma.right[item.dot] !== undefined && !isFinal(item.gramma.right[item.dot])) {
        // 非终结符
        let symbolNextToDot = item.gramma.right[item.dot];
        for (let generateRight of gramma[symbolNextToDot]) {
          let newItem = new Item(symbolNextToDot, generateRight, firstSet.getFirst(item, item.forwordSet));
          this.itemList.push(newItem);
          unClosureList.push(newItem);
        }
      }
    }
    // 归约相同产生式而forwordSet不同的item
    let formulaSet = {};
    for(let itemIndex = 0; itemIndex < this.itemList.length; ) {
      let item = this.itemList[itemIndex];
      let formula = item.formulaString();
      if (formulaSet[formula] === undefined) {
        formulaSet[formula] = item;
        itemIndex++;
      } else {
        formulaSet[formula].forwordSet = First.combineSet(formulaSet[formula].forwordSet, item.forwordSet);
        this.itemList.splice(itemIndex, 1); // 这里去掉了一个，不需要加1操作了
      }
    }
  };

  print() {
    let str = '>>> Stats : ' + this.getHash() + ' <<<\n';
    str += this.toString();
    str += '\n---------------------------\n';
    for(let key in this.goto) {
      str += (key + ' => ' + this.goto[key].getHash() + '\n');
    }
    console.log(str);
  }
}

module.exports = Stats;

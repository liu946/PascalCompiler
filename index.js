"use strict";

const wordAnalyzer = require('./wordAnalyzer');
const Stats = require('./grammaAnalyzer');
const Item = require('./grammaAnalyzer/item');
//const fs = require('fs');
//fs.readFile('/Users/liu/Desktop/ts.psc', function(err, data){
//  if (err) return;
//  let list = wordAnalyzer.analyze(data.toString());
//  for (let i of list) {
//    console.log(i.format());
//  }
//});

class StatsSet {
  constructor() {
    this.statsDict = {};
  }

  register(stats) {
    let hash = stats.getHash();
    if (this.statsDict[hash] === undefined) {
      this.statsDict[hash] = stats;
      return true; // 返回true表示新注册了时间，需要放入队列继续计算其goto集合
    }
    return false;
  }
}
let stratStats = new Stats();
let statsSet = new StatsSet();

stratStats.pushItem(new Item('<Start>', '<S>', ['$']));
stratStats.closure();
statsSet.register(stratStats);

let unResolvedStats = [stratStats];

while (unResolvedStats.length) {
  let stats = unResolvedStats.shift();
  for (let item of stats.itemList) {
    if (item.dot < item.gramma.right.length) {
      let newItem = new Item(item.gramma.left, item.gramma.right, item.forwordSet, item.dot + 1);
      let newStats = new Stats(); newStats.pushItem(newItem);
      newStats.closure(); // 建立通往状态的闭包
      if(statsSet.register(newStats)) {
        unResolvedStats.push(newStats);
      } else {
        newStats = statsSet.statsDict[newStats.getHash()]; // 使用之前建立Stats的索引
      }
      stats.setGoto(item.gramma.right[item.dot], newStats);
    }
  }
}


for (let s in statsSet.statsDict) {
  statsSet.statsDict[s].print();
}


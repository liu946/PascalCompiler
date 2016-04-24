/**
 * Created by liu on 16/4/10.
 */
'use strict';
const Item = require('./item');
const Stats = require('./stats');
const SymbolStack = require('../semanticAnalyzer/symbolStack');
const semantic = require('../semanticAnalyzer');
class StatsStack {
  constructor(firstStats) {
    this.stack = [firstStats];
  }

  push(stats) {
    this.stack.push(stats);
  }

  pop(num) {
    if (num > this.stack.length) {
      throw '要求弹出数目超过栈空间';
    }
    for (let i = num; i; i--) {
      this.stack.pop();
    }
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  length() {
    return this.stack.length;
  }

  toString() {
    return this.stack.join(' ');
  }

}

class StatsSet {
  constructor() {
    this.statsDict = {};

    // 构造初始节点
    let startStats = new Stats();
    this.startStats = startStats;
    startStats.pushItem(new Item('<Start>', '<Program>', ['$']));
    startStats.closure();
    this._register(startStats);
    this._init();
  }

  /**
   * 语法分析函数，最后一步
   * @param wordListOrigin
   */
  analyze(wordListOrigin) {
    // 为原始文本添加一个终结符号token
    let wordList = wordListOrigin.concat({type: '$'});
    let pointer = 0;
    let statsStack = new StatsStack(this.startStats);

    let symbolStack = new SymbolStack(); // 这里用一个track方法，用于输出归约符号栈中的东西，与逻辑无关 todo 删除

    analyzeLoop: while (statsStack.length()) {
      let action = statsStack.top().action[wordList[pointer].type];
      if (action === undefined) {
        throw 'unexpected token ' + wordList[pointer] + '\n';
      }
      switch (action.action) {
        case 'shift':
          statsStack.push(action.stats);
          symbolStack.push(wordList[pointer]);
          pointer++;
          break;
        case 'reduce':
          statsStack.pop(action.gramma.right.length);
          let reduceRight = symbolStack.pop(action.gramma.right.length);
          statsStack.push(statsStack.top().goto[action.gramma.left]);
          // 此处放置归约处理程序
          let grammaMark = action.gramma.left + ' => ' + action.gramma.right.join(' ');
          let reduceLeft = semantic.reduceAction(grammaMark, action.gramma.left, reduceRight);
          //
          symbolStack.push(reduceLeft);
          break;
        case 'acc':
          break analyzeLoop;
        default :
          throw 'Error action';
      }

      // 输出归约情况 todo 删除
      console.log('\t' + symbolStack.toString());
    }

  }

  /**
   * 有初始节点之后根据文法建立DFA
   *
   * 图起始点为 this.startStats
   * Stats.goto 记录图中的边
   * Stats.action 记录图中“移进”、“归约”动作。
   *
   */
  _init() {
    let unResolvedStats = [this.startStats];

    while (unResolvedStats.length) {
      let stats = unResolvedStats.shift();
      for (let item of stats.itemList) {
        if (item.dot < item.gramma.right.length) {
          if (item.gramma.right[0] === '') { // 不使用空产生式生成新状态
            item.gramma.right = []; // 生成式是空的，就设置为空的生成，这样就可以利用这个生成式reduce。
            continue;
          }
          let newItem = new Item(item.gramma.left, item.gramma.right, item.forwordSet, item.dot + 1);
          let newStats =
              stats.goto[item.gramma.right[item.dot]] === undefined
                ?
                new Stats()
                :
                stats.goto[item.gramma.right[item.dot]];
          newStats.pushItem(newItem);
          newStats.closure();
          stats.setGoto(item.gramma.right[item.dot], newStats);

        }
      }
      // 对向外的状态进行状态注册
      for (let symbol in stats.goto) {
        if(this._register(stats.goto[symbol])) {
          unResolvedStats.push(stats.goto[symbol]);
        } else {
          stats.setGoto(symbol, this.statsDict[stats.goto[symbol].getHash()]); // 使用之前建立Stats的索引
        }
      }

      //// print
      //console.log('<<<<<<<<<<<<<<<<<<<<< 分割线 >>>>>>>>>>>>>>>>>>>>>>>')
      //for (let s in statsSet.statsDict) {
      //  statsSet.statsDict[s].print();
      //}
    }
  }

  /**
   * 向状态集合中记录一个新的状态
   * @param stats
   * @returns {boolean}
   * @private
   */
  _register(stats) {
    let hash = stats.getHash();
    if (this.statsDict[hash] === undefined) {
      this.statsDict[hash] = stats;
      return true; // 返回true表示新注册了时间，需要放入队列继续计算其goto集合
    }
    return false;
  }

  /**
   * 打印状态集合
   */
  print() {
    let statsCount = 0;
    for (let s in this.statsDict) {
      statsCount++;
      this.statsDict[s].print();
    }
    console.log('状态数 ' + statsCount);
  }
}

module.exports = StatsSet;

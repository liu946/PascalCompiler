/**
 * Created by liu on 16/4/10.
 */
'use strict';

const gramma = require('./gramma');






class Item {

  /**
   * @param left '<非终结符>'
   * @param right ['生成字符', '生成字符', '生成字符']
   * @param forwardSet ['a','b','$']
   * @param [dot] Number
   */
  constructor(left, right, forwardSet, dot = 0) {
    this.gramma = {left, right};
    this.forwordSet = forwardSet;
    this.dot = dot;
  }

  toString() {
    return this.gramma.left + ' => ' + this.gramma.right.splice(this.dot, 0, '.').join(' ') + ' | ' + this.forwordSet.sort().join(' ');
  }

  equal(that) {
    return this.toString() === that.toString();
  }
}

class Stats {
  constructor() {
    this.itemList = [];
  }

  pushItem(item) {
    this.itemList.push(item);
  }

}
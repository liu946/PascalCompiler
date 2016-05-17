/**
 * Created by liu on 16/4/17.
 */
'use strict';

class Item {

  /**
   * @param left '<非终结符>'
   * @param right ['生成字符', '生成字符', '生成字符']
   * @param forwardSet ['a','b','$']
   * @param [dot] Number
   */
  constructor(left, right, forwardSet, dot) {
    dot = dot | 0;
    this.gramma = {left, right: typeof (right) === 'string' ? right.split(' ') : right};
    this.gramma.right = (this.gramma.right[0] === '') ? [] : this.gramma.right; // 如果右端为字符串空产生式，表示成[]空产生式
    this.forwordSet = forwardSet.map((x) => x);
    this.dot = dot;
  }

  formulaString() {
    return this.gramma.left + ' => ' + this._addingDot().join(' ');
  }

  toString() {
    return this.formulaString() + ' | ' + this.forwordSet.sort().join(' ');
  }

  _addingDot() {
    let right = this.gramma.right.map((x) => x);
    right.splice(this.dot, 0, '.');
    return right;
  }

  combineFormulaSet (thatSet) {
    const recordMap = {};
    const forwordSet = this.forwordSet;
    this.forwordSet.map(function (x) {
      recordMap[x] = true;
    });
    thatSet.map(function (x) {
      if (recordMap[x] === undefined) {
        forwordSet.push(x);
      }
    });
  }

  equal(that) {
    return this.toString() === that.toString();
  }
}

module.exports = Item;

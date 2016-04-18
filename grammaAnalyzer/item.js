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
    this.forwordSet = forwardSet;
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

  equal(that) {
    return this.toString() === that.toString();
  }
}

module.exports = Item;

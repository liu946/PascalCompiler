/**
 * Created by liu on 16/4/23.
 */

'use strict';
const basicGramma = require('../gramma');
const Symbol = require('./symbol');

const noOption = function(leftSymbol, rightList) {
  // 可以执行如下指令
  // leftSymbol.setAttr(key,val);
  // rightList[0].getAttr(key);
};

class Formula {
  constructor(left, right, action) {
    this.gramma = {left, right};
    this.action = (action === undefined) ? noOption : action;
  }

  getLabel() {
    return this.gramma.left + ' => ' + this.gramma.right;
  }

  reduceAction(left, rightList) {
    left = new Symbol(left);
    this.action.call(this, left, rightList);
    console.log('[REDUCE] ' + left.toString() + ' => ' + rightList.map((x)=>x.toString()).join(' '));
    return left;
  }
}

class FormulaSet {
  constructor(gramma) {
    this.set = {};
    for (let left in gramma) {
      for (let rightIndex in gramma[left]) {
        const formula = new Formula(left, gramma[left][rightIndex].generatorRight, gramma[left][rightIndex].generatorFunction);
        this.set[formula.getLabel()] = formula;
      }
    }
  }

  reduceAction(grammaMark, left, rightList) {
    return this.set[grammaMark].reduceAction(left, rightList);
  }
}

module.exports = new FormulaSet(basicGramma);


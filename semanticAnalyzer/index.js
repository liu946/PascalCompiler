/**
 * Created by liu on 16/4/23.
 */

'use strict';
const basicGramma = require('../gramma');
const Symbol = require('./symbol');

class Formula {
  constructor(left, right, action) {
    this.gramma = {left, right};
    this.action = action;
  }

  getLabel() {
    return this.gramma.left + ' => ' + this.gramma.right;
  }

  reduceAction(left, rightList) {
    left = new Symbol(left);
    this.action.call(this, left, rightList);
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


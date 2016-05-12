/**
 * Created by liu on 16/5/12.
 */
'use strict';

class LoopStack {
  constructor() {
    this.list = [];
  }

  enterNewLoop() {
    this.list.push([]);
  }

  registerBreak(instr) {
    this.list[this.list.length - 1].push(instr);
  }

  getBreakList() {
    return this.list[this.list.length - 1];
  }

  popBreakList() {
    return this.list.pop();
  }
}

module.exports = new LoopStack();


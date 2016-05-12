/**
 * Created by liu on 16/5/8.
 */
'use strict';
// rep => EJ | NE | GEJ
exports.relation = function(op) {
  return function(leftSymbol) {
    leftSymbol.setAttr('op', op);
  }
};

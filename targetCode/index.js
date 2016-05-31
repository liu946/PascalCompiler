/**
 * Created by liu on 16/5/23.
 */

'use strict';

exports.gramma = require('./nasmGramma');
exports.generator = require('./nasmCode');

exports.compile = function (code) {
  exports.gramma[code.op](code.a1, code.a2, code.result);
};

exports.codeGenerator = null;

exports.getGenerator = function () {
  return exports.codeGenerator;
};

exports.setCodeGenerator = function (codeGen) {
  exports.codeGenerator = codeGen;
};

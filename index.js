"use strict";

const wordAnalyzer = require('./wordAnalyzer');

let list = wordAnalyzer.analyze('Program\n ex11; Begin \nWriteln(123);\t\nReadLn;\n End.');
for (let i of list) {
  console.log(i.format());
}



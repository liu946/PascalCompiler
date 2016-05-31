"use strict";

const wordAnalyzer = require('./wordAnalyzer');
const StatsSet = require('./grammaAnalyzer');
const fs = require('fs');
const code = require('./threeAddressCode');
const optimizer = require('./optimize');
fs.readFile('./ts.psc', function(err, data){
  if (err) return;
  let list = wordAnalyzer.analyze(data.toString());
  let s = new StatsSet();
  //s.print();
  s.analyze(list);
  code.print();
  optimizer.init(code.list);
  optimizer.compile();
  optimizer.print();
  console.log(optimizer.getCode());
});





"use strict";

const wordAnalyzer = require('./wordAnalyzer');
const StatsSet = require('./grammaAnalyzer');
const fs = require('fs');
fs.readFile('./ts.psc', function(err, data){
  if (err) return;
  let list = wordAnalyzer.analyze(data.toString());
  let s = new StatsSet();
  s.print();
  s.analyze(list);
});





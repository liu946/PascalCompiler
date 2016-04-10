"use strict";

const wordAnalyzer = require('./wordAnalyzer');
const fs = require('fs');
fs.readFile('/Users/liu/Desktop/ts.psc', function(err, data){
  if (err) return;
  let list = wordAnalyzer.analyze(data.toString());
  for (let i of list) {
    console.log(i.format());
  }
});




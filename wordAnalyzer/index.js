/**
 * Created by liu on 16/3/28.
 */
"use strict";

const Reader = require('./reader');
const debug = require('debug')('wordAnalyzer');
const assert = require('assert');
const keyWord = [
  'case','const',
  'div','do','downto','else','file',
  'for','func','goto','in','lable',
  'mod','nil','packed',
  'proc','record','repeat','set',
  'to','type','until','var','while','with',
  // structure
  'program','begin','end',
  // Boolean expression
  'and','or','not',
  // IF
  'if', 'then',
  // type , type的常量表达式使用TYPE_EXP表示
  'integer', 'real', 'boolean', 'char', 'string',
  'array', 'of',
];

const type = {
  'PLUS': '+',
  'MINUS': '-',
  'MULTI': '*',
  'RDIV': '/',
  'EQ': '=',
  'LT': '<',
  'GT': '>',
  'LE': '<=',
  'GE': '>=',
  'NE': '<>',
  'LR_BRAC': '(',
  'RR_BRAC': ')',
  'COMMA': ',',
  'F_STOP': '.',
  'RANGE': '..',
  'COLON': ':',
  'ASSIGN': ':=',
  'SEMIC': ';',
  'CAP': '^',
  'EXP': '**',
  'LS_BRAC': '[',
  'RS_BRAC': ']',
  'Q_MARK': '\''
};

const char = {};
char.lowerLetter  = 'abcdefghijklmnopqrstuvwxyz';
char.upperLetter  = char.lowerLetter.toUpperCase();
char.letter       = char.lowerLetter + char.upperLetter;
char.number       = '1234567890';
char.dot          = '.';
char.symbol       = '+-*/^:<>=!,()[].\'";';
char.space        = '\t\n\r ';
char.comment      = '{}';
char.all          = char.letter + char.symbol + char.space + char.number + char.comment;

/**
 * DFA自动机的状态类
 */
let autoStateName = 1;
class State {
  /**
   *
   * @param name 状态的标志名字，考虑自动补充
   * @param isFinal 这个状态是否可以是终结。如果是终结，看一下是否立刻终结
   * @param finalNow 这个状态是否要立刻终结，如果是就生成这个状态的 TYPE，如果不是，读下一个，没有可以走的路再终结
   * @param type
   */
  constructor(isFinal, finalNow, type, name) {
    this.name = name ? name : (autoStateName++);
    this.path = {};
    this.isFinal = isFinal;
    this.finalNow = finalNow;
    this.type = type;
  }

  addPath(pattern, state) {
    this.path[pattern] = state;
  }

  hasPath(char) {
    for (let key in this.path) {
      if (-1 !== key.indexOf(char)) {
        return key;
      }
    }
    return null;
  }
}


class DFA {
  constructor() {
    this.startStatus = new State(false, false, null);

    // 构造ID|KEYWORD
    let letter_status = new State(true, false, 'ID|KEYWORD');
    this.startStatus.addPath(char.letter + '_', letter_status);
    letter_status.addPath(char.letter + char.number + '_', letter_status);

    // 构造数字
    let digit_status = new State(true, false, 'INT_EXP');
    let real_status = new State(true, false, 'REAL_EXP');
    this.startStatus.addPath(char.number, digit_status);
    digit_status.addPath('.' , real_status);
    digit_status.addPath(char.number , digit_status);
    real_status.addPath(char.number, real_status);

    // 构造符号
    for (let symboltype in type) {
      this._addingSymbol(symboltype, type[symboltype]);
    }

    // 构造字符串
    let string_status = new State(false, false, 'STRING_EXP');
    let string_end = new State(true, true, 'STRING_EXP');
    this.startStatus.addPath('"', string_status);
    string_status.addPath('"', string_end);
    string_status.addPath(char.all, string_status);

    // 构造注释
    let comment_status = new State(false, false, 'COMMENT');
    let comment_end = new State(true, true, 'COMMENT');
    this.startStatus.addPath('{', comment_status);
    comment_status.addPath('}', comment_end);
    comment_status.addPath(char.all, comment_status);

  }

  _addingSymbol(type, symbol) {
    let nowStatus = this.startStatus;
    for (let i = 0; i < symbol.length; i++) {
      let path = nowStatus.hasPath(symbol[i]);
      if (path) {

        // 如果存在这个路径，要把现在状态的立即停止标志置为false
        nowStatus.path[path].finalNow = false;
      } else {

        // 如果不存在路径就新建一个状态，并转移
        var newStatus = new State(false, false, null);
        nowStatus.addPath(symbol[i], newStatus);
        if (symbol.length - 1 === i) {

          //如果i是最后一个字符
          newStatus.finalNow = newStatus.isFinal = true;
          newStatus.type = type;
        }
      }
      nowStatus = nowStatus.path[path];

    }
  }

  analyze(codeString) {
    let reader = new Reader(codeString, char.all);
    let codeStatus = {pointer: 0, reading: ''};
    let tokenArray = [];
    //读取前需要去掉空白
    this.removeBlank(reader, codeStatus);
    while(codeStatus.pointer < codeString.length) {
      tokenArray.push(this.getOneWord(reader, codeStatus));
      this.removeBlank(reader, codeStatus);
      codeStatus.reading = '';
    }
    return tokenArray;
  }

  removeBlank(reader, codeStatus){
    while(
        reader.code.length > codeStatus.pointer
        &&
        char.space.indexOf(reader.get(codeStatus.pointer)) !== -1
      )
      codeStatus.pointer++;
  }

  getOneWord(codeReader, codeStatus) {
    let nowStatus = this.startStatus;
    while(true) {
      let char = codeReader.get(codeStatus.pointer++);
      let path = nowStatus.hasPath(char);
      if (path) {
        codeStatus.reading += char;
        let nextStatus = nowStatus.path[path];
        if (nextStatus.isFinal) {
          if (nextStatus.finalNow || !nextStatus.hasPath(codeReader.uncheckGet(codeStatus.pointer))) {
            return new Word(nextStatus.type, codeStatus.reading);
          }
        }
      } else {
        debug('无法识别的token 位置'+ codeReader.geolocation);
        this.catchError();
      }
      nowStatus = nowStatus.path[path];
    }
  }

  catchError() {
    // todo 错误处理
    assert(0);
  }
}

/**
 * constructor(type, value)
 * format()
 */
class Word {
  constructor(type, value) {
    switch (type) {
      case 'ID|KEYWORD':
        if (~keyWord.indexOf(value.toLowerCase())) {
          this.type = value.toUpperCase();
          return;
        } else {
          this.type = 'ID';
        }
        break;
      case 'STRING':
        value = value.substr(0, value.length - 1).substr(1);
        this.type = type;
        break;
      default :
        this.type = type;
    }
    this.value = value;
  }

  format() {
    return '(' + this.type + ', "' + this.value + '")';
  }
}

module.exports = new DFA();

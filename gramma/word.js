/**
 * Created by liu on 16/5/1.
 */

const keyWord = [
  'case','const',
  'div','do','downto','else','file',
  'for','func','goto','in','lable',
  'mod','nil','packed',
  'proc','record','repeat','set',
  'to','type','until','while','with',
  // structure
  'program',
  'const','var',
  'begin','end',
  // Boolean expression
  'and','or','not',
  // IF
  'if', 'then',
  // type , type的常量表达式使用TYPE_EXP表示
  'integer', 'real', 'boolean', 'char',
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

module.exports = {keyWord, type, char};

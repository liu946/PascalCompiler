/**
 * Created by liu on 16/4/19.
 */
/**
 * 符号表
 * @not_singleton
 * 符号表的结构如下
 * {
 *  [name]: {
 *    type: 'var',
 *    [others]
 *  },
 *  ...
 * }
 *
 * @note:
 * 1. 名字可以使用连续内存存储字符串，而每个名字字段存储偏移
 *
 */
class IdentifierSheet {
  constructor(parent = null) {
    this.sheet = {};
    this.parentSheet = parent;
  }

  register(name, symbolDescribe) {
    if (this.sheet[name] !== undefined) {
      throw name + ' is already defined in this scope!';
    } else {
      this.sheet[name] = symbolDescribe;
    }
  }

  getDescribe(name) {
    if (this.sheet[name] !== undefined) {
      return this.sheet[name];
    } else if (this.parentSheet !== null) {
      return this.parentSheet.getDescribe(name);
    } else {
      throw 'undefined symbol ' + name;
    }
  }
}

function IdentifierDescribeFactory() {

}


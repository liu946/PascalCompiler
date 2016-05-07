/**
 * Created by liu on 16/5/3.
 */
'use strict';

class Identifier {
  /**
   *
   * @param attr
   * @param address
   * @param name
   * @param type 这里的type是 标识符的类型，function, var, record
   */
  constructor (attr, address, name, type) {
    this.attr = attr;
    this.address = address;
    this.name = name;
    this.type = type ? type : 'var';
  }

  toString () {
    return (this.name ? this.name : "$" + this.address) + ' ' +
      this.address + ' ' +
      this.attr.type + '(' + this.attr.space + ')';
  }
}

module.exports = Identifier;

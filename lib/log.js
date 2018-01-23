'use strict';
const litelog = require('litelog');

let log = litelog.create({
  sys: {
    level: 'DEBUG'
  }
});

log.colorful(true);

log.setFormatter(function (obj) {
  /**
    level: level,
    pid: pid,
    type: type,
    pos: pos,
    msg: msg,
    color: colorful ? color : function (level, msg) {
      return msg;
    },
    time: getTime
   */
  return obj.color('BLUE', '[' + obj.time() + '] [' + obj.level + ']') + ' ' + obj.msg;
});

module.exports = log;

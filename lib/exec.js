'use strict';

const log = require('./log');
const exec = require('child_process').execSync;

/**
 * @param {string} cmd
 * @param {boolean|string} desc
 */
module.exports = function run(cmd, desc) {
  if (desc) {
    log.info(desc === true ? cmd : desc);
  }
  exec(cmd, {stdio: 'inherit'});
};

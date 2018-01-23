'use strict';
const path = require('path');
const chalk = require('chalk');
const request = require('request');

// check dtboost version
module.exports.checkCli = function () {
  var pkg = require('../package.json');
  var option = {
    url: 'http://registry.npm.alibaba-inc.com/@ali/honeycomb-cli',
    timeout: 4000
  };
  request(option, function (err, res) {
    if (err) {
      return;
    }
    try {
      var body = JSON.parse(res.body);
      var latestVserion = body['dist-tags'].latest;
    } catch (e) {
      return;
    }
    if (latestVserion !== pkg.version) {
      var warn = chalk.yellow('[WARNING]');
      latestVserion = chalk.green(latestVserion);
      var localVersion = chalk.yellow(pkg.version);
      console.log(`${warn} honeycomb-cli 最新版本是 ${latestVserion}, 您的本地版本是 ${localVersion}`);
      console.log(`${warn} 您可以执行: ${chalk.green('tnpm install -g @ali/honeycomb-cli@latest')} 来安装最新版本`);
      console.log(`${warn} 如果提示没有权限，建议用 nvm 恢复您电脑上的的node环境, 不要使用sudo重试`);
    }
  });
};

module.exports.checkFramework = function () {
  var appDir = process.cwd();
  var fpath = path.join(appDir, './node_modules/@ali/dtboost-framework/package.json');
  var pkg;
  try {
    pkg = require(fpath);
  } catch (e) {
    console.log(chalk.yellow('请在你的app根目录下执行该命令。'));
    return;
  }
  var option = {
    url: 'http://registry.npm.alibaba-inc.com/@ali/dtboost-framework',
    timeout: 4000
  };
  request(option, function (err, res) {
    if (err) {
      return;
    }
    try {
      var body = JSON.parse(res.body);
      var releaseVserion = body['dist-tags'].release;
      var tmpVserion = body['dist-tags'].tmp;
    } catch (e) {
      return;
    }
    if (pkg.version.indexOf('1') === 0) {
      compare(tmpVserion, pkg.version);
    } else {
      compare(releaseVserion, pkg.version);
    }
  });
};

function compare(latestVserion, currentVersion) {
  if (latestVserion > currentVersion) {
    const err = chalk.red('[ERROR]');
    const localVersion = chalk.yellow(currentVersion);
    const installCmd = chalk.green('tnpm update @ali/dtboost-framework');
    latestVserion = chalk.green(latestVserion);
    console.log(chalk.red('*********************************************************************************'));
    console.log(`*${err} dtboost-framework 最新版本是 ${latestVserion}, 您的本地版本是 ${localVersion}`);
    console.log(`*${err} 建议您执行: ${installCmd} 来安装最新版本`);
    console.log(chalk.red('*********************************************************************************'));
  }
}



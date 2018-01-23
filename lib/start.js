'use strict';

const chalk = require('chalk');
const path = require('path');
const ip = require('ip');
const fs = require('xfs');
const filewatcher = require('filewatcher');
const hook = require('./require_hook');
const genAutoRouter = require('../lib/gen_auto_router').genAutoRouter;

let watcher = filewatcher();
let dir = process.cwd();
let app;
let appPath = path.join(dir, '/app');

process.on('uncaughtException', (msg) => {
  console.log(chalk.red('[ERROR]', msg.stack || msg)); // eslint-disable-line
});


process.on('error', (msg) => {
 console.log(chalk.red('[ERROR]', msg));  // eslint-disable-line
});

watcher.on('change', (file, stat) => {
  watcher.removeAll();

  console.log(chalk.magenta(`\n\n\nsource code change [${file}], reload app`)); // eslint-disable-line
  process.exit(0);
});

watcher.on('fallback', function (limit) {
  console.log('Ran out of file handles after watching %s files.', limit); // eslint-disable-line
  console.log('Falling back to polling which uses more CPU.'); // eslint-disable-line
  console.log('Run ulimit -n 10000 to increase the limit for open files.'); // eslint-disable-line
});

// because of genAutoRouter, we need to watch controller dir
watcher.add(path.join(dir, 'controller'));
hook(function (module, filename) {
  watcher.add(filename);
});

if (fs.existsSync(path.join(dir, 'config/config_dev.js'))) {
  let file = fs.readFileSync(path.join(dir, 'config/config_dev.js'));
  fs.writeFileSync(path.join(dir, 'config/config.js'), file);
} else {
  console.log(chalk.yellow('[WARN] config/config_dev.js not found')); // eslint-disable-line
}

try {
  genAutoRouter();
  app = require(appPath);
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND' && e.message.includes(`'${appPath}'`)) {
    console.log(chalk.red('[ERROR] current path is not a app root')); // eslint-disable-line
    process.exit(1);
  }  else {
    console.log(chalk.red('[ERROR] loading app failed:', e.stack || e)); // eslint-disable-line
  }
}

var appCfg = require(dir + '/package.json');

var honeycombCfg = appCfg.honeycomb || appCfg.dtboost;
if (!honeycombCfg) {
  honeycombCfg = {
    port: 8001
  };
}

var port = parseInt(process.argv[3], 10) || honeycombCfg.port;
if (!port) {
  console.log(chalk.red('[ERROR] server port is not specified')); // eslint-disable-line
  console.log(chalk.green('======================================================================')); // eslint-disable-line
  console.log(chalk.green('1. you can set port with -p or --port, like: `honeycomb start -p 8080`')); // eslint-disable-line
  console.log(chalk.green('2. you also can set port in package.json\'s honeycomb item')); // eslint-disable-line
  console.log(chalk.green('======================================================================')); // eslint-disable-line
  process.exit(1);
}

if (app) {
  var ipAddr = ip.address();
  var url = 'http://' + ipAddr + ':' + port + (app.options.prefix || '/');

  console.log(chalk.blue('waiting for app ready')); // eslint-disable-line

  app.run(function (err, server, isTask) {
    if (!isTask) {
      console.log(chalk.blue('App started. Serving on: '), chalk.green.underline(url)); // eslint-disable-line
    } else {
      console.log(chalk.blue('Task started.')); // eslint-disable-line
    }
  }, {
    ip: ipAddr,
    port: port
  });
}

const co = require('co');
const fs = require('fs-extra');
const path = require('path');
const log = require('./log');
const run = require('./exec');

const { join } = path;

/**
 * 打包前端文件, 有可能会被用户覆盖
 * @param {Object} config
 * @param {String} dir
 */
const front = (config, dir) => {
  log.info('begin to build front end code');
  return co(function* () {
    const assetsDir = join(dir, 'assets');
    if (!fs.existsSync(join(assetsDir, 'package.json'))) {
      return;
    }
    run(`cd ${assetsDir} && npm install --${config.env}`, 'install frontend dependences');
    run(`cd ${assetsDir} && npm install honeypack`, 'install honeypack');
    run(`cd ${assetsDir} && node ${join('node_modules', 'honeypack', 'bin', 'honeypack')} build`);

    // 移动静态目录
    if (fs.existsSync(`${join(assetsDir, 'static')}`)) {
      log.info('move static file');
      yield fs.copy(`${join(assetsDir, 'static')}`, `${join(assetsDir, '.package', 'static')}`);
      log.info('move static file success');
    }
    log.info('assets build done');
  });
};

/**
 * 打包后端文件, 有可能会被用户覆盖
 * @param {*} config
 * @param {*} dir
 */
const release = (config, dir) => {
  log.info('begin to build server file');
  log.info('package env', config.env);
  const env = config.env || 'production';
  return co(function* () {
    const releaseDir = join(dir, 'out', 'release');
    yield fs.mkdirp(releaseDir);
    log.info('begin to remove release dir');
    yield fs.remove(releaseDir);
    yield fs.mkdirp(releaseDir);
    const list = fs.readdirSync(dir);
    const exclude = [
      '.git',
      'node_modules',
      'out',
      'test',
      'assets',
    ];
    for (let item of list) {
      if (exclude.indexOf(item) >= 0) {
        continue;
      }
      yield fs.copy(
        join(dir, item),
        join(releaseDir, item)
      );
    }

    // 移动前端文件
    const assetsDir = join(dir, 'assets', '.package');
    if (fs.existsSync(assetsDir)) {
      yield fs.move(
        assetsDir,
        join(releaseDir, 'assets'),
      );
    }

    // 安装依赖
    run(`cd ${releaseDir} && npm install --${config.env}`, 'install project dependences');
    log.info('cover config');

    // 覆盖config
    if (fs.existsSync(join(releaseDir, 'config', `config_${env}.js`))) {
      yield fs.copy(
        join(releaseDir, 'config', `config_${env}.js`),
        join(releaseDir, 'config', 'config.js'),
        {
          overwrite: true
        }
      );
    }
    log.info('build server end');
  });
};

module.exports = [
  front,
  release
];



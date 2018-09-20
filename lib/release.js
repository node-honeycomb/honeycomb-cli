const path = require('path');

const {join} = path;

/**
 * 打包前端文件, 有可能会被用户覆盖
 * @param {Object} config
 * @param {String} dir
 */
exports.front = async (config, dir, {run, log, fs}) => {
  log.info('begin to build front end code');
  const assetsDir = join(dir, 'assets');
  const needToInstall = fs.existsSync(join(assetsDir, 'package.json'));

  if (needToInstall) {
    run(`cd ${assetsDir} && npm install --${config.env}`, 'install frontend dependences');
    run(`cd ${assetsDir} && npm install honeypack`, 'install honeypack');
    run(`cd ${assetsDir} && node ${join('node_modules', 'honeypack', 'bin', 'honeypack')} build`);
  }

  // 处理honeypack无法打包的情况
  const packDir = join(assetsDir, '.package');
  if (!fs.existsSync(packDir)) {
    fs.mkdirpSync(packDir);
  }

  const count = fs.readdirSync(packDir);
  if (count.length === 0) {
    const list = fs.readdirSync(assetsDir);
    const exclude = [
      '.package',
      'static'
    ];

    for (let item of list) {
      if (exclude.indexOf(item) >= 0) {
        continue;
      }
      // 复制文件到.package
      await fs.copy(
        join(assetsDir, item),
        join(assetsDir, '.package', item)
      );
    }
  }

  // 移动静态目录
  if (fs.existsSync(`${join(assetsDir, 'static')}`)) {
    log.info('move static file');
    await fs.copy(`${join(assetsDir, 'static')}`, `${join(assetsDir, '.package', 'static')}`);
    log.info('move static file success');
  }
  log.info('assets build done');
};

/**
 * 打包后端文件, 有可能会被用户覆盖
 * @param {*} config
 * @param {*} dir
 */
exports.release = async (config, dir, {run, log, fs}) => {
  log.info('begin to build server file');
  log.info('package env', config.env);
  const env = config.env || 'production';
  const releaseDir = join(dir, 'out', 'release');
  await fs.mkdirp(releaseDir);
  log.info('begin to remove release dir');
  await fs.remove(releaseDir);
  await fs.mkdirp(releaseDir);
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
    await fs.copy(
      join(dir, item),
      join(releaseDir, item)
    );
  }

  // 移动前端文件
  const assetsDir = join(dir, 'assets', '.package');
  if (fs.existsSync(assetsDir)) {
    await fs.move(
      assetsDir,
      join(releaseDir, 'assets'),
    );
  }

  // 安装依赖
  run(`cd ${releaseDir} && npm install --${config.env}`, 'install project dependences');
  log.info('cover config');

  // 覆盖config
  if (fs.existsSync(join(releaseDir, 'config', `config_${env}.js`))) {
    await fs.copy(
      join(releaseDir, 'config', `config_${env}.js`),
      join(releaseDir, 'config', 'config.js'),
      {
        overwrite: true
      }
    );
  }
  log.info('build server end');
};

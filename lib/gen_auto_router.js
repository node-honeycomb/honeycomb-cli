'use strict';
const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const os = require('os');

function genAutoRouter(options) {
  options = options || {};
  let appRoot = process.cwd();
  let ctrlPath = path.join(appRoot, './controller');
  let cmd = JSON.stringify(process.execPath) + ' ' + path.resolve(require.resolve('api-annotation'), '../bin/api-annotation.js');
  if (!fs.existsSync(ctrlPath)) {
    // eslint-disable-next-line no-console
    console.log('[WARN] controller dir not fould, ignore gen auto_router');
    return;
  }
  let pkg = require(path.join(appRoot, './package.json'));
  if (options.doc) {
    cmd += ' --doc ' + path.join(appRoot, './document');
  }

  cmd += ' --api-version ' + pkg.version;
  cmd += ' -o ' + path.join(appRoot, './auto_router.js');
  cmd += ' ' + ctrlPath;

  let timeout = ['win32', 'cygwin'].indexOf(os.platform()) >= 0 ? 60000 : 10000;
  try {
    const localConfig = require(path.join(os.homedir(), '.honeycomb.json'));
    if (localConfig.timeout && Number(localConfig.timeout)) {
      timeout = localConfig.timeout;
    }
  } catch (e) {
    // no tips here
  }


  let res = execSync(cmd, {
    cwd: appRoot,
    timeout: timeout
  }).toString();
  if (/ERROR/.test(res)) {
    // eslint-disable-next-line no-console
    console.error('gen_auto_router_failed:', res);
    process.exit(1);
  }
}

module.exports.genAutoRouter = genAutoRouter;

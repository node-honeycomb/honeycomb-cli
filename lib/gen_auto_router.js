'use strict';
const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

function genAutoRouter(options) {
  options = options || {};
  let appRoot = process.cwd();
  let ctrlPath = path.join(appRoot, './controller');
  let cmd = JSON.stringify(process.execPath) + ' ' + path.resolve(require.resolve('api-annotation'), '../bin/api-annotation.js');
  if (!fs.existsSync(ctrlPath)) {
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
  let res = execSync(cmd, {
    cwd: appRoot,
    timeout: 10000
  }).toString();

  if (/ERROR/.test(res)) {
    console.error('gen_auto_router_failed:', res);
    throw res;
  }
}

module.exports.genAutoRouter = genAutoRouter;

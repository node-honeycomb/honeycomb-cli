'use strict';
const path = require('path');
const fs = require('fs');

module.exports = function (dir) {
  const appPath = path.join(process.cwd(), dir);
  const appName = dir === '.' ? 'example' : dir;
  const appPackage = require(path.join(appPath, 'package.json'));

  try {
    fs.renameSync(path.join(appPath, 'gitignore'), path.join(appPath, '.gitignore'));
  } catch (err) {
    console.error('rename .gitignore failed', err);  // eslint-disable-line no-console
  }

  processPackage(appPackage, appName);
  fs.writeFileSync(path.join(appPath, 'package.json'), JSON.stringify(appPackage, null, 2));
};

function processPackage(appPackage, appName) {
  appPackage.name = appName;

  if (appPackage.scripts) {
    delete appPackage.scripts.prepublishOnly;
  }
  delete appPackage.publishConfig;
}

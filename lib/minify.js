'use strict';
var path = require('path');
var esminify = require('esminify');
var cwd = process.cwd();
const _ = require('lodash');

function minify(opt) {
  opt = opt || {};
  var appDir = process.cwd();
  let option = {
    input: path.join(appDir, opt.input || './'),
    output: path.join(appDir, 'out/release'),
    exclude: [/assets\//, /^\/logs/, /^\/out/, /^\/bin/, /^\/documents/, /^\/run/, /^\/test/, /^\/views/, /^\/.package/],
    config: {

    },
    onFileProcess: function (obj) {
      // eslint-disable-next-line no-console
      console.log('minify file:', obj.input.substr(cwd.length + 1), '>', obj.output.substr(cwd.length + 1));
    }
  };
  const pkgJsonPath = path.join(appDir, 'package.json');
  const pkgJson = require(pkgJsonPath);
  const appOpts = _.pick((pkgJson.minify || {}), ['exclude', 'config', 'output']);
  option = _.merge(option, appOpts);
  esminify.minify(option, () => {
    process.exit();
  });
}

module.exports = minify;

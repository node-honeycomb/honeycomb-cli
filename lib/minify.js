'use strict';
var path = require('path');
var esminify = require('esminify');
var cwd = process.cwd();

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
  esminify.minify(option, () => {
    process.exit();
  });
}

module.exports = minify;

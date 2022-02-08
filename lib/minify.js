'use strict';
var path = require('path');
var esminify = require('esminify');
var cwd = process.cwd();
const fs = require('xfs');
const _ = require('lodash');
const run = require('../lib/exec');

function getModuleName(p) {
  let dir = path.dirname(p);
  let mName = path.basename(dir);

  let scope = path.basename(path.dirname(dir));
  if (/^@/.test(scope)) {
    return path.join(scope, mName);
  } else {
    return mName;
  }
}

function saveLicense(file, obj) {
  let res = [];
  Object.keys(obj).forEach((key) => {
    res.push('[' + key + ']');
    res.push(obj[key].toString());
  });
  fs.writeFileSync(file, res.join('\n'));
}

const ignoreKeys = ['bugs', 'devDependencies', 'description', 'deprecated', 'homepage',
  'repository', 'keywords'
];

function minifyPackageJson(input, output) {
  let d = JSON.parse(fs.readFileSync(input));
  let res = {};
  Object.keys(d).forEach((k) => {
    if (/^_/.test(k)) {
      return;
    }
    if (ignoreKeys.indexOf(k) !== -1) {
      return;
    }
    res[k] = d[k];
  });
  fs.sync().save(output, JSON.stringify(res));
}

function minify(opt, callback) {
  opt = opt || {};
  var appDir = process.cwd();
  let option = {
    input: path.join(appDir, opt.input || './'),
    output: path.join(appDir, 'out/release'),
    exclude: [/assets\//, /^\/logs/, /^\/out/, /^\/bin/, /^\/documents/, /^\/run/, /^\/test/, /^\/views/, /^\/.package/],
    config: {
      deadcode: {
        keepFnArgs: true
      }
    },
    onFileProcess: function (obj) {
      // eslint-disable-next-line no-console
      console.log('minify file:', obj.input.substr(cwd.length + 1), '>', obj.output.substr(cwd.length + 1));
    }
  };
  const pkgJsonPath = path.join(appDir, 'package.json');
  const pkgJson = require(pkgJsonPath);
  let appOpts = _.get(pkgJson, 'honeycomb.minify') || {};
  appOpts = _.pick(appOpts, ['exclude', 'config', 'output']);
  option = _.merge(option, appOpts);
  esminify.minify(option, callback || function() {});
}

function minifyNodeModules(callback) {
  var appDir = process.cwd();
  var licenses = {};
  let option = {
    input: path.join(appDir, 'out/release/node_modules'),
    output: path.join(appDir, 'out/release/node_modules_new'),
    overrideExclude: true,
    exclude: [],
    config: {
      mangle: {
        keepFnName: true,
        keepClassName: true
      },
      deadcode: {
        keepFnArgs: true
      }
    },
    onFileProcess: function (obj) {
      if (/\.min\.js$/.test(obj.input)) {
        // return true for copy
        return true;
      }

      if (/\.js\.map$/.test(obj.input)) {
        return false;
      }

      if (/license(\.(\w+))?$/ig.test(obj.input)) {
        let moduleName = getModuleName(obj.input);
        licenses[moduleName] = fs.readFileSync(obj.input);
        return false;
      }

      if (/(readme|history|changelog|release|releasenote)(\.(md|txt))?$/ig.test(obj.input)) {
        return false;
      }

      if (/readme\.(md|txt)$/ig.test(obj.input)) {
        return false;
      }

      let fname = path.basename(obj.input);
      if (fname === '.travis.yml' || fname === '.npmignore' || fname === '.gitmodules' || fname === '.jshinitrc') {
        return false;
      }

      if (fname === 'package.json') {
        try {
          minifyPackageJson(obj.input, obj.output);
          return false;
        } catch (e) {
          console.log('>>>> package.json error', obj.input);
          // just copy file
          return true;
        }
      }
      // eslint-disable-next-line no-console
      console.log('minify file:', obj.input.substr(cwd.length + 1), '>', obj.output.substr(cwd.length + 1));
    }
  };
  esminify.minify(option, () => {
    let srcRoot = path.join(appDir, 'out/release/node_modules');
    let destRoot = path.join(appDir, 'out/release/node_modules_new');
    saveLicense(path.join(destRoot, 'licenses'), licenses);
    fs.sync().rm(srcRoot);
    fs.renameSync(destRoot, srcRoot)
    callback && callback();
  });
}

exports.minify = minify;
exports.minifyNodeModules = minifyNodeModules;

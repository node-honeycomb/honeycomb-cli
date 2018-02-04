'use strict';
const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const apiAnnotation = require('api-annotation');
function genAutoRouter(options) {
  options = options || {};

  let appRoot = process.cwd();
  let ctrlPath = path.join(appRoot, './controller');
  let pkg = require(path.join(appRoot, './package.json'));

  apiAnnotation.process(ctrlPath, function (err, data) {
    if (options.compileCallback) {
      options.compileCallback(data);
    }
    /**
     * 产生路由
     */
    let routerOptions = {
      // tpl: tpl,
      routerFile: path.join(appRoot, './auto_router.js'),
      version: pkg.version
    };
  
    apiAnnotation.genRouter(data, routerOptions, (err) => {
      if (err) {
        console.error('gen_auto_router_failed:', err);
        throw err;
      } else {
        console.log('SUCCESS'); // eslint-disable-line
        options.callback && options.callback();
      }
    });
  
    if (options.doc) {
      let docOptions = {
        ctrlPath: ctrlPath,
        docPath: options.doc,
        version: pkg.version
      };
      apiAnnotation.genDocument(data, docOptions, (err) => {
        if (err) {
          console.log('ERROR', err); // eslint-disable-line
        } else {
          console.log('SUCCESS'); // eslint-disable-line
        }
      });
    }
  });
}

module.exports.genAutoRouter = genAutoRouter;

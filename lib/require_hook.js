'use strict';
const Module = require('module');

module.exports = function (pre, post) {
  Object.keys(Module._extensions).forEach((ext) => {
    const origin = Module._extensions[ext];

    Module._extensions[ext] = function honeycombHook(module, filename) {
      pre && pre(module, filename);
      origin(module, filename);
      post && post(module, filename);
    };
  });
};

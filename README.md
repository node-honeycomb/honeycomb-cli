# honeycomb-cli

the Command line tools for honeycomb app dev.

English | [中文](https://github.com/node-honeycomb/honeycomb-cli/wiki/%E4%B8%AD%E6%96%87%E7%89%88%E8%AF%B4%E6%98%8E)

## Installation

```
npm install honeycomb-cli -g
```

## Usage

### Initialize an App

```
honeycomb init [-t template] [-s scope] [--registry registry] [directory]
```

+ `template`, app template, default is `simple`, `console` is also available
+ `scope`, npm scope, you can specify npm scope to get private templates, e.g. `-s @ali`
+ `registry`, npm registry, it will download packages from the default npm registry, if your network is slow, you can use npm mirrors like `https://registry.npm.taobao.org`
+ `directory`, the folder which contains app files, default is the current folder

### Start an App

```
cd path/to/app
honeycomb start [-p port] [-o domain] [--inspect]
```

+ `port`, app's listen port, default is 8001
+ `-o domain`, open browser with the domain after app's started

### Pack an App

```
cd path/to/app
honeycomb package [-env env]
```

+ `env`, load specific env config, default is `production`

### Global Config

```
// display config
honeycomb config KEY

// set config
honeycomb config KEY VALUE
```

+ currently, only `registry` config is supported

### minify config

package.json

```json
{
  "minify": {
    "ignoreNodeModules": false // 跳过node_modules目录
  }
}
```

### Others

You can use `honeycomb --help` and `honeycomb COMMAND --help` to get full commands and full options.
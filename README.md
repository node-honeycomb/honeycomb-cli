# honeycomb-cli

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

### Others

You can use `honeycomb --help` and `honeycomb COMMAND --help` to get full commands and full options.

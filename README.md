# babel-plugin-transform-class-inject-directive

[![Travis](https://img.shields.io/travis/homer0/babel-plugin-transform-class-inject-directive.svg?style=flat-square)](https://travis-ci.org/homer0/babel-plugin-transform-class-inject-directive)
[![Coveralls github](https://img.shields.io/coveralls/github/homer0/babel-plugin-transform-class-inject-directive.svg?style=flat-square)](https://coveralls.io/github/homer0/babel-plugin-transform-class-inject-directive?branch=master)
[![David](https://img.shields.io/david/homer0/babel-plugin-transform-class-inject-directive.svg?style=flat-square)](https://david-dm.org/homer0/babel-plugin-transform-class-inject-directive)
[![David](https://img.shields.io/david/dev/homer0/babel-plugin-transform-class-inject-directive.svg?style=flat-square)](https://david-dm.org/homer0/babel-plugin-transform-class-inject-directive)

This is a utility for projects that relay heavily on classes and dependency injection. If a class constructor uses an `'inject'` directive, the list of parameter names will be copied as strings and placed on an `inject` static property, so your DI tool can read them.

## Example

### In

```js
class MyService {
  constructor(depOne, depTwo) {
    'inject';
    ...
  }
}
```

### Out

```js
class MyService {
  constructor(depOne, depTwo) {
    'inject';
    ...
  }
}

MyService.inject = ['depOne', 'depTwo']
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["transform-class-inject-directive"]
}
```

### Via CLI

```sh
babel --plugins transform-class-inject-directive script.js
```

### Via Node API

```javascript
require('@babel/core').transform('code', {
  plugins: ['transform-class-inject-directive'],
});
```

## Options

### `directive`

`string`, defaults to `inject`.

Tells the plugin which is the name of the directive it should find in order to apply the transformation.

### `property`

`string`, defaults to `inject`.

This is the name of the property the plugin will create in order to define the list of dependencies.

## Warning

This only works on classes and regular functions (no arrow). The idea was for it to only work on classes, and the only reason it also works with functions is in order to add support in case you are transforming classes.

## Development

Before doing anything, install the repository hooks:

```bash
# You can either use npm or yarn, it doesn't matter
yarn run hooks
```

### NPM/Yarn Tasks

| Task                 | Description                         |
|----------------------|-------------------------------------|
| `yarn run hooks`     | Install the GIT repository hooks.   |
| `yarn test`          | Run the project unit tests.         |
| `yarn run lint`      | Lint the modified files.            |
| `yarn run lint:full` | Lint the project code.              |
| `yarn run docs`      | Generate the project documentation. |
| `yarn run todo`      | List all the pending to-do's.       |

### Testing

I use [Jest](https://facebook.github.io/jest/) with [Jest-Ex](https://yarnpkg.com/en/package/jest-ex) to test the project. The configuration file is on `./.jestrc`, the tests and mocks are on `./tests` and the script that runs it is on `./utils/scripts/test`.

### Linting

I use [ESlint](http://eslint.org) to validate all our JS code. The configuration file for the project code is on `./.eslintrc` and for the tests on `./tests/.eslintrc` (which inherits from the one on the root), there's also an `./.eslintignore` to ignore some files on the process, and the script that runs it is on `./utils/scripts/lint`.

### Documentation

I use [ESDoc](http://esdoc.org) to generate HTML documentation for the project. The configuration file is on `./.esdocrc` and the script that runs it is on `./utils/scripts/docs`.

### To-Dos

I use `@todo` comments to write all the pending improvements and fixes, and [Leasot](https://yarnpkg.com/en/package/leasot) to generate a report. The script that runs it is on `./utils/scripts/todo`.
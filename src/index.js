const InjectDirectiveParser = require('./injectDirectiveParser');
/**
 * Generates the object that Babel will load in order to hook the parser for every functions and
 * methods are being processed.
 * @return {BabelPluginTransformClassInjectDirective}
 */
const plugin = () => {
  let parser;
  return {
    visitor: {
      ClassMethod: {
        enter(path) {
          if (parser) {
            parser.parseClassMethod(path);
          } else {
            throw new Error('`ClassMethod.enter` can\'t be called before `Program.enter`');
          }
        },
      },
      FunctionDeclaration: {
        enter(path) {
          if (path) {
            parser.parseFunction(path);
          } else {
            throw new Error('`FunctionDeclaration.enter` can\'t be called before `Program.enter`');
          }
        },
      },
      FunctionExpression: {
        enter(path) {
          if (path) {
            parser.parseFunction(path);
          } else {
            throw new Error('`FunctionExpression.enter` can\'t be called before `Program.enter`');
          }
        },
      },
      Program: {
        enter(path, file) {
          parser = new InjectDirectiveParser(file);
        },
        exit() {
          if (parser) {
            parser.transform();
          } else {
            throw new Error('`Program.exit` can\'t be called before `Program.enter`');
          }
        },
      },
    },
  };
};

module.exports = plugin;

const InjectDirectiveParser = require('./injectDirectiveParser');

module.exports = () => {
  let parser;
  return {
    visitor: {
      ClassMethod: {
        enter(path) {
          parser.parseClassMethod(path);
        },
      },
      FunctionDeclaration: {
        enter(path) {
          parser.parseFunction(path);
        },
      },
      FunctionExpression: {
        enter(path) {
          parser.parseFunction(path);
        },
      },
      Program: {
        enter(path, file) {
          parser = new InjectDirectiveParser(file);
        },
        exit() {
          parser.transform();
        },
      },
    },
  };
};

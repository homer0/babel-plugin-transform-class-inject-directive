const babelTypes = require('babel-types');

class InjectDirectiveParser {
  constructor(file) {
    this._options = this._parseOptions(file.opts);
    this._paths = [];
  }

  parseClassMethod(path) {
    if (
      path.node.kind === 'constructor' &&
      this._hasDirective(path)
    ) {
      path.getAncestry().some((ancestor) => {
        let stop = false;
        if (ancestor.isClassDeclaration() || ancestor.isClassExpression()) {
          stop = true;
          this._addPath(ancestor);
        }

        return stop;
      });
    }
  }

  parseFunction(path) {
    if (this._hasDirective(path)) {
      if (babelTypes.isFunctionDeclaration(path.node)) {
        this._addPath(path);
      } else if (babelTypes.isVariableDeclarator(path.parent)) {
        this._addPath(path.parentPath);
      }
    }
  }

  transform() {
    this._paths.forEach((path) => this._transformPath(path));
  }

  _addPath(path) {
    if (!this._pathExists(path)) {
      this._paths.push(path);
    }
  }

  _addPropertyAfterPath(params, path, name) {
    const newPath = Object.assign({}, path);
    newPath.node.trailingComments = [];
    newPath.parentPath.scope.crawl();
    newPath.insertAfter(this._createPropertyExpression(name, params));
  }

  _addPropertyBeforePath(params, path, name) {
    const binding = path.scope.getBinding(name);
    const expression = this._createPropertyExpression(name, params);
    if (binding && binding.kind === 'hoisted') {
      let block = binding.scope.getBlockParent().path;
      if (block.isFunction()) {
        block = block.get('body');
      }

      block.unshiftContainer('body', [expression]);
    } else {
      path.parentPath.scope.crawl();
      path.insertAfter(expression);
    }
  }

  _createPropertyExpression(name, params) {
    const left = babelTypes.isNode(name) ? name : babelTypes.identifier(name);
    const paramsAsString = params.map((param) => (
      babelTypes.stringLiteral(this._getParamName(param))
    ));
    const list = babelTypes.arrayExpression(paramsAsString);
    const member = babelTypes.memberExpression(
      left,
      babelTypes.identifier(this._options.property)
    );
    return babelTypes.expressionStatement(babelTypes.assignmentExpression('=', member, list));
  }

  _generatePathId(path) {
    return `${path.node.start}-${path.node.end}`;
  }

  _getClassConstructor(clsNode) {
    return clsNode.body.body.find((node) => node.kind === 'constructor');
  }

  _getParamName(param) {
    const newParam = babelTypes.isAssignmentPattern(param) ?
      param.left :
      param;

    return newParam.name;
  }

  _hasDirective(path) {
    let result = false;
    const { directives } = path.node.body;
    if (directives && directives.length) {
      result = directives.some(({ value }) => value.value === this._options.directive);
    }

    return result;
  }

  _pathExists(path) {
    const id = this._generatePathId(path);
    return this._paths.some((pathItem) => this._generatePathId(pathItem) === id);
  }

  _parseOptions(options = {}) {
    return Object.assign(
      {
        directive: 'inject',
        property: 'inject',
      },
      options
    );
  }

  _transformPath(originalPath) {
    let path = originalPath;
    let { node } = path;

    let topPath;
    let name;
    if (babelTypes.isVariableDeclarator(path.node)) {
      topPath = path.parentPath;
      ({ name } = node.id);
      node = node.init;
      path = path.get('init');
      ({ node } = path);
    } else {
      topPath = path;
    }

    if (babelTypes.isExportDeclaration(topPath.parent)) {
      topPath = topPath.parentPath;
    }

    if (babelTypes.isClass(node)) {
      ({ name } = node.id);
      node = this._getClassConstructor(node);
    }

    const hasParams = node.params.length >= 1;
    if ((babelTypes.isFunctionExpression(node) && hasParams) || babelTypes.isClassMethod(node)) {
      this._addPropertyAfterPath(node.params, topPath, name);
    } else if (babelTypes.isFunctionDeclaration(node) && hasParams) {
      this._addPropertyBeforePath(node.params, path, node.id.name);
    }
  }
}

module.exports = InjectDirectiveParser;

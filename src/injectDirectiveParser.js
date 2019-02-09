const babelTypes = require('@babel/types');
/**
 * Parses class methods and functions in order to detect the use of an _"inject directive"_ and
 * replace it with a static property.
 * This class works as a helper for a Babel plugin.
 * @example
 * // Input
 * class MyService {
 *   constructor(depOne, depTwo) {
 *     'inject';
 *     ...
 *   }
 * }
 * // Output
 * class MyService {
 *   constructor(depOne, depTwo) {
 *     'inject';
 *     ...
 *   }
 * }
 * MyService.inject = ['depOne', 'depTwo']
 */
class InjectDirectiveParser {
  /**
   * @param {Path} file The information of the File Babel is processing.
   */
  constructor(file) {
    /**
     * A dictionary with the parser options.
     * @type {Object}
     * @property {String} directive The name of the directive it should find in order to apply the
     *                              transformation.
     * @property {String} property  The name of the property where the dependencies will be added.
     * @access protected
     * @ignore
     */
    this._options = this._parseOptions(file.opts);
    /**
     * The list of {@link Path} elements that were added via the _"parse methods"_. Once
     * {@link InjectDirectiveParser#transform} gets called, they will be processed and the
     * transformation applied.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._paths = [];
  }
  /**
   * This is called from a {@link ParserCallback} when the object being processed is a class
   * method.
   * @param {Path} path The information of the object being processed.
   */
  parseClassMethod(path) {
    // Only check for constructor methods that have the directive.
    if (
      path.node.kind === 'constructor' &&
      this._hasDirective(path)
    ) {
      // Find the class declaration/expression for that constructor and add it to the list.
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
  /**
   * This is called from a {@link ParserCallback} when the object being processed is a function
   * expression/declaration.
   * @param {Path} path The information of the object being processed.
   */
  parseFunction(path) {
    // Check if it has the directive.
    if (this._hasDirective(path)) {
      // If it's a function declaration, add it to the list.
      if (babelTypes.isFunctionDeclaration(path.node)) {
        this._addPath(path);
      } else if (babelTypes.isVariableDeclarator(path.parent)) {
        /**
         * otherwise, if it's an expression (being declared through a variable), add the parent
         * path.
         */
        this._addPath(path.parentPath);
      }
    }
  }
  /**
   * This is called from {@link ProgramVisitorFinish}, it takes all the parsed elements and
   * processes them in order to apply the transformations.
   */
  transform() {
    this._paths.forEach((path) => this._transformPath(path));
  }
  /**
   * Adds a path to the list that will be processed, after checking that is not already there.
   * @param {Path} path The path to add.
   * @access protected
   * @ignore
   */
  _addPath(path) {
    if (!this._pathExists(path)) {
      this._paths.push(path);
    }
  }
  /**
   * Adds the property with the dependencies after an specific {@link Path}.
   * @param {Array}  params The list of parameters.
   * @param {Path}   path   The reference {@link Path}.
   * @param {String} name   The name of the function/method/variable _"owner"_ of the property.
   * @access protected
   * @ignore
   */
  _addPropertyAfterPath(params, path, name) {
    const newPath = Object.assign({}, path);
    newPath.node.trailingComments = [];
    newPath.parentPath.scope.crawl();
    newPath.insertAfter(this._createPropertyExpression(name, params));
  }
  /**
   * Tries to add the property with the dependencies after an specific {@link Path}. By _"try"_, it
   * means that it will check if the function is hoisted and in that case it will try to add it
   * on the top of the scope, otherwise, it will just add it after.
   * @param {Array}  params The list of parameters.
   * @param {Path}   path   The reference {@link Path}.
   * @param {String} name   The name of the function/method/variable _"owner"_ of the property.
   * @access protected
   * @ignore
   */
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
  /**
   * Creates the declaration of the property and its value.
   * @param {String} name   The name of the function/method/variable _"owner"_ of the property.
   * @param {Array}  params The list of parameters the function/method receives.
   * @return {ExpressionStatement}
   * @access protected
   * @ignore
   */
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
  /**
   * A helper function that generates a unique ID for a given {@link Path}. This is used by
   * {@link InjectDirectiveParser#_addPath} when trying to identify if a path is already on the
   * list.
   * @param {Path} path The path for which the ID will be generated.
   * @return {String}
   * @access protected
   * @ignore
   */
  _generatePathId(path) {
    return `${path.node.start}-${path.node.end}`;
  }
  /**
   * Given the {@link Node} of a class declaration/expression, this method will try to find the
   * {@link Node} for its constructor.
   * @param {Node} clsNode A class declaration/expression node.
   * @return {?Node}
   * @access protected
   * @ignore
   */
  _getClassConstructor(clsNode) {
    return clsNode.body.body.find((node) => node.kind === 'constructor');
  }
  /**
   * Given a function/method parameter, this method will check if it's an actuall raw parameter,
   * in which case it will return it as it is, or an {@link AssignmentExpression}, where the name
   * is on the `left` property.
   * @param {string|AssignmentExpression} param The parameter information.
   * @return {string}
   * @access protected
   * @ignore
   */
  _getParamName(param) {
    const newParam = babelTypes.isAssignmentPattern(param) ?
      param.left :
      param;

    return newParam.name;
  }
  /**
   * Checks whether a functon/method has the required directive.
   * @param {Path} path The function/method path.
   * @return {Boolean}
   * @access protected
   * @ignore
   */
  _hasDirective(path) {
    let result = false;
    const { directives } = path.node.body;
    if (directives && directives.length) {
      result = directives.some(({ value }) => value.value === this._options.directive);
    }

    return result;
  }
  /**
   * Checks whether a {@link Path} is already on the list that will be processed or not.
   * @param {Path} path The path to check.
   * @return {Boolean}
   * @access protected
   * @ignore
   */
  _pathExists(path) {
    const id = this._generatePathId(path);
    return this._paths.some((pathItem) => this._generatePathId(pathItem) === id);
  }
  /**
   * Generates a new set of options for the class by merging the received paramter and a set of
   * defaults. This is called from the constructor, using the recived file options as overwrites.
   * @param  {Object} [options={}] The options to overwrite the default ones.
   * @return {Object}
   * @property {string} directive The name of the directive the parser will look for.
   * @property {string} property  The name of the property where the dependencies will be defined.
   * @access protected
   * @ignore
   */
  _parseOptions(options = {}) {
    return Object.assign(
      {
        directive: 'inject',
        property: 'inject',
      },
      options
    );
  }
  /**
   * Processes and transform a given {@link Path} in order to add the required property.
   * @param {Path} originalPath The path to transform.
   * @access protected
   * @ignore
   */
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

    if (node.params.length) {
      if (babelTypes.isFunctionExpression(node) || babelTypes.isClassMethod(node)) {
        this._addPropertyAfterPath(node.params, topPath, name);
      } else {
        this._addPropertyBeforePath(node.params, path, node.id.name);
      }
    }
  }
}

module.exports = InjectDirectiveParser;

/**
 * @external {Path} https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-paths
 */

/**
 * @external {Node} https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md
 */

/**
 * @external {ExpressionStatement} https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md
 */

/**
 * @external {AssignmentExpression} https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md
 */

/**
 * @typedef {Function} ParserCallback
 * @param {Path} path The Babel information for the object that is currently being processed.
 * @throws {Error} if called before {@link ProgramVisitorStart}.
 */

/**
 * @typedef {Object} ClassMethodVisitor
 * @property {ParserCallback} enter This is called when Babel starts processing the method.
 */

/**
 * @typedef {Object} FunctionDeclarationVisitor
 * @property {ParserCallback} enter This is called when Babel starts processing the function.
 */

/**
 * @typedef {Object} FunctionExpressionVisitor
 * @property {ParserCallback} enter This is called when Babel starts processing the function.
 */

/**
 * @typedef {Function} ProgramVisitorStart
 */

/**
 * @typedef {Function} ProgramVisitorFinish
 * @throws {error} if called before {@link ProgramVisitorStart}
 */

/**
 * @typedef {Object} ProgramVisitor
 * @property {ProgramVisitorStart}  enter This method is called when Babel starts processing a
 *                                        file. It takes care of creating an instance of
 *                                        {@link InjectDirectiveParser} so the other
 *                                        {@link ParserCallback} can use.
 * @property {ProgramVisitorFinish} exit  This method is called when Babel finishes processing a
 *                                        file. After parsing all available methods and functions,
 *                                        it uses the instance of {@link InjectDirectiveParser}
 *                                        to apply the changes on the code.
 */

/**
 * @typedef {Object} Visitors
 * @property {ClassMethodVisitor}         ClassMethod         The methods inside this object are
 *                                                            only called when Babel is processing
 *                                                            a class method.
 * @property {FunctionDeclarationVisitor} FunctionDeclaration The methods inside this object are
 *                                                            only called when Babel is processing
 *                                                            a function declaration
 *                                                            (`function name (...) { }`).
 * @property {FunctionExpressionVisitor}  FunctionExpression  The methods inside this object are
 *                                                            only called when Babel is processing
 *                                                            a function expression
 *                                                            (`const name = function (...) { }`).
 * @property {ProgramVisitor}             Program             The methods inside this object are
 *                                                            called when Babel starts and
 *                                                            finishes processing file.
 */

/**
 * @typedef {Object} BabelPluginTransformClassInjectDirective
 * @property {Visitors} visitor A dictionary with keys for each object type Babel processes. In the
 *                              case of this plugin, it only has keys for methods and functions.
 */

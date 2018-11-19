const babelTypes = require('/tests/mocks/babelTypes.mock');

jest.mock('babel-types', () => babelTypes);
jest.unmock('/src/injectDirectiveParser');

require('jasmine-expect');

const InjectDirectiveParser = require('/src/injectDirectiveParser');

describe('InjectDirectiveParser', () => {
  beforeEach(() => {
    babelTypes.mockClear();
  });

  it('should be instantiated', () => {
    // Given
    let sut = null;
    // When
    sut = new InjectDirectiveParser({});
    // Then
    expect(sut).toBeInstanceOf(InjectDirectiveParser);
  });

  it('should parse and transform a method from a class declaration', () => {
    // Given
    babelTypes.isVariableDeclarator.mockImplementationOnce(() => false);
    babelTypes.isExportDeclaration.mockImplementationOnce(() => false);
    babelTypes.isClass.mockImplementationOnce(() => true);
    babelTypes.isFunctionExpression.mockImplementationOnce(() => false);
    babelTypes.isClassMethod.mockImplementationOnce(() => true);
    babelTypes.isNode.mockImplementationOnce(() => true);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.arrayExpression.mockImplementationOnce((list) => list);
    babelTypes.identifier.mockImplementationOnce((prop) => prop);
    babelTypes.memberExpression.mockImplementationOnce((left, right) => ({ left, right }));
    babelTypes.expressionStatement.mockImplementationOnce((exp) => exp);
    babelTypes.assignmentExpression.mockImplementationOnce((operator, name, list) => ({
      operator,
      name,
      list,
    }));
    let sut = null;
    const directive = 'inject';
    const property = 'inject';
    const file = {
      opts: {
        directive,
        property,
      },
    };
    const ancestry = [];
    const params = [{ name: 'depOne' }, { name: 'depTwo' }];
    const paramNames = params.map((param) => param.name);
    const classMethodPath = {
      getAncestry: jest.fn(() => ancestry),
      node: {
        start: 3,
        end: 4,
        kind: 'constructor',
        body: {
          directives: [{
            value: {
              value: directive,
            },
          }],
        },
        params,
      },
    };
    const className = 'myClass';
    const classDeclarationPath = {
      isClassDeclaration: jest.fn(() => true),
      insertAfter: jest.fn(),
      node: {
        start: 1,
        end: 2,
        id: {
          name: className,
        },
        body: {
          body: [classMethodPath.node],
        },
      },
      parent: 'classDeclarationParentPath',
      parentPath: {
        scope: {
          crawl: jest.fn(),
        },
      },
      trailingComments: ['something'],
    };
    ancestry.push(classDeclarationPath);
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseClassMethod(classMethodPath);
    sut.transform();
    // Then
    expect(classMethodPath.getAncestry).toHaveBeenCalledTimes(1);
    expect(classDeclarationPath.isClassDeclaration).toHaveBeenCalledTimes(1);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledTimes(1);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledWith(classDeclarationPath.node);
    expect(babelTypes.isExportDeclaration).toHaveBeenCalledTimes(1);
    expect(babelTypes.isExportDeclaration).toHaveBeenCalledWith(classDeclarationPath.parent);
    expect(babelTypes.isClass).toHaveBeenCalledTimes(1);
    expect(babelTypes.isClass).toHaveBeenCalledWith(classDeclarationPath.node);
    expect(babelTypes.isFunctionExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.isFunctionExpression).toHaveBeenCalledWith(classMethodPath.node);
    expect(babelTypes.isClassMethod).toHaveBeenCalledTimes(1);
    expect(babelTypes.isClassMethod).toHaveBeenCalledWith(classMethodPath.node);
    expect(classDeclarationPath.parentPath.scope.crawl).toHaveBeenCalledTimes(1);
    expect(babelTypes.isNode).toHaveBeenCalledTimes(1);
    expect(babelTypes.isNode).toHaveBeenCalledWith(className);
    expect(babelTypes.stringLiteral).toHaveBeenCalledTimes(params.length);
    expect(babelTypes.isAssignmentPattern).toHaveBeenCalledTimes(params.length);
    params.forEach((param) => {
      expect(babelTypes.isAssignmentPattern).toHaveBeenCalledWith(param);
      expect(babelTypes.stringLiteral).toHaveBeenCalledWith(param.name);
    });
    expect(babelTypes.arrayExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.arrayExpression).toHaveBeenCalledWith(paramNames);
    expect(babelTypes.identifier).toHaveBeenCalledTimes(1);
    expect(babelTypes.identifier).toHaveBeenCalledWith(property);
    expect(babelTypes.memberExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.memberExpression).toHaveBeenCalledWith(className, property);
    expect(babelTypes.assignmentExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.assignmentExpression).toHaveBeenCalledWith(
      '=',
      {
        left: className,
        right: property,
      },
      paramNames
    );
    expect(babelTypes.expressionStatement).toHaveBeenCalledTimes(1);
    expect(babelTypes.expressionStatement).toHaveBeenCalledWith({
      operator: '=',
      name: {
        left: className,
        right: property,
      },
      list: paramNames,
    });
    expect(classDeclarationPath.insertAfter).toHaveBeenCalledTimes(1);
    expect(classDeclarationPath.insertAfter).toHaveBeenCalledWith({
      operator: '=',
      name: {
        left: className,
        right: property,
      },
      list: paramNames,
    });
  });

  it('should parse and transform a method from a class expression', () => {
    // Given
    babelTypes.isVariableDeclarator.mockImplementationOnce(() => false);
    babelTypes.isExportDeclaration.mockImplementationOnce(() => false);
    babelTypes.isClass.mockImplementationOnce(() => true);
    babelTypes.isFunctionExpression.mockImplementationOnce(() => false);
    babelTypes.isClassMethod.mockImplementationOnce(() => true);
    babelTypes.isNode.mockImplementationOnce(() => true);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.arrayExpression.mockImplementationOnce((list) => list);
    babelTypes.identifier.mockImplementationOnce((prop) => prop);
    babelTypes.memberExpression.mockImplementationOnce((left, right) => ({ left, right }));
    babelTypes.expressionStatement.mockImplementationOnce((exp) => exp);
    babelTypes.assignmentExpression.mockImplementationOnce((operator, name, list) => ({
      operator,
      name,
      list,
    }));
    let sut = null;
    const directive = 'inject';
    const property = 'inject';
    const file = {
      opts: {
        directive,
        property,
      },
    };
    const ancestry = [];
    const params = [{ name: 'depOne' }, { name: 'depTwo' }];
    const paramNames = params.map((param) => param.name);
    const classMethodPath = {
      getAncestry: jest.fn(() => ancestry),
      node: {
        start: 3,
        end: 4,
        kind: 'constructor',
        body: {
          directives: [{
            value: {
              value: directive,
            },
          }],
        },
        params,
      },
    };
    const className = 'myClass';
    const classExpressionPath = {
      isClassDeclaration: jest.fn(() => false),
      isClassExpression: jest.fn(() => true),
      insertAfter: jest.fn(),
      node: {
        start: 1,
        end: 2,
        id: {
          name: className,
        },
        body: {
          body: [classMethodPath.node],
        },
      },
      parent: 'classDeclarationParentPath',
      parentPath: {
        scope: {
          crawl: jest.fn(),
        },
      },
      trailingComments: ['something'],
    };
    ancestry.push(classExpressionPath);
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseClassMethod(classMethodPath);
    sut.transform();
    // Then
    expect(classExpressionPath.insertAfter).toHaveBeenCalledTimes(1);
    expect(classExpressionPath.insertAfter).toHaveBeenCalledWith({
      operator: '=',
      name: {
        left: className,
        right: property,
      },
      list: paramNames,
    });
  });

  it('should parse and transform a method with a parameter with a default value', () => {
    // Given
    babelTypes.isVariableDeclarator.mockImplementationOnce(() => false);
    babelTypes.isExportDeclaration.mockImplementationOnce(() => false);
    babelTypes.isClass.mockImplementationOnce(() => true);
    babelTypes.isFunctionExpression.mockImplementationOnce(() => false);
    babelTypes.isClassMethod.mockImplementationOnce(() => true);
    babelTypes.isNode.mockImplementationOnce(() => true);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => true);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.arrayExpression.mockImplementationOnce((list) => list);
    babelTypes.identifier.mockImplementationOnce((prop) => prop);
    babelTypes.memberExpression.mockImplementationOnce((left, right) => ({ left, right }));
    babelTypes.expressionStatement.mockImplementationOnce((exp) => exp);
    babelTypes.assignmentExpression.mockImplementationOnce((operator, name, list) => ({
      operator,
      name,
      list,
    }));
    let sut = null;
    const directive = 'inject';
    const property = 'inject';
    const file = {
      opts: {
        directive,
        property,
      },
    };
    const ancestry = [];
    const params = [{
      left: {
        name: 'depOne',
      },
    }];
    const paramNames = params.map((param) => param.left.name);
    const classMethodPath = {
      getAncestry: jest.fn(() => ancestry),
      node: {
        start: 3,
        end: 4,
        kind: 'constructor',
        body: {
          directives: [{
            value: {
              value: directive,
            },
          }],
        },
        params,
      },
    };
    const className = 'myClass';
    const classExpressionPath = {
      isClassDeclaration: jest.fn(() => false),
      isClassExpression: jest.fn(() => true),
      insertAfter: jest.fn(),
      node: {
        start: 1,
        end: 2,
        id: {
          name: className,
        },
        body: {
          body: [classMethodPath.node],
        },
      },
      parent: 'classDeclarationParentPath',
      parentPath: {
        scope: {
          crawl: jest.fn(),
        },
      },
      trailingComments: ['something'],
    };
    ancestry.push(classExpressionPath);
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseClassMethod(classMethodPath);
    sut.transform();
    // Then
    expect(classExpressionPath.insertAfter).toHaveBeenCalledTimes(1);
    expect(classExpressionPath.insertAfter).toHaveBeenCalledWith({
      operator: '=',
      name: {
        left: className,
        right: property,
      },
      list: paramNames,
    });
  });

  it('shouldn\'t parse nor transform a method more than once', () => {
    // Given
    babelTypes.isVariableDeclarator.mockImplementationOnce(() => false);
    babelTypes.isExportDeclaration.mockImplementationOnce(() => false);
    babelTypes.isClass.mockImplementationOnce(() => true);
    babelTypes.isFunctionExpression.mockImplementationOnce(() => false);
    babelTypes.isClassMethod.mockImplementationOnce(() => true);
    babelTypes.isNode.mockImplementationOnce(() => true);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.arrayExpression.mockImplementationOnce((list) => list);
    babelTypes.identifier.mockImplementationOnce((prop) => prop);
    babelTypes.memberExpression.mockImplementationOnce((left, right) => ({ left, right }));
    babelTypes.expressionStatement.mockImplementationOnce((exp) => exp);
    babelTypes.assignmentExpression.mockImplementationOnce((operator, name, list) => ({
      operator,
      name,
      list,
    }));
    let sut = null;
    const directive = 'inject';
    const property = 'inject';
    const file = {
      opts: {
        directive,
        property,
      },
    };
    const ancestry = [];
    const params = [{ name: 'depOne' }, { name: 'depTwo' }];
    const paramNames = params.map((param) => param.name);
    const classMethodPath = {
      getAncestry: jest.fn(() => ancestry),
      node: {
        start: 3,
        end: 4,
        kind: 'constructor',
        body: {
          directives: [{
            value: {
              value: directive,
            },
          }],
        },
        params,
      },
    };
    const className = 'myClass';
    const classExpressionPath = {
      isClassDeclaration: jest.fn(() => false),
      isClassExpression: jest.fn(() => true),
      insertAfter: jest.fn(),
      node: {
        start: 1,
        end: 2,
        id: {
          name: className,
        },
        body: {
          body: [classMethodPath.node],
        },
      },
      parent: 'classDeclarationParentPath',
      parentPath: {
        scope: {
          crawl: jest.fn(),
        },
      },
      trailingComments: ['something'],
    };
    ancestry.push(classExpressionPath);
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseClassMethod(classMethodPath);
    sut.parseClassMethod(classMethodPath);
    sut.transform();
    // Then
    expect(classExpressionPath.insertAfter).toHaveBeenCalledTimes(1);
    expect(classExpressionPath.insertAfter).toHaveBeenCalledWith({
      operator: '=',
      name: {
        left: className,
        right: property,
      },
      list: paramNames,
    });
  });

  it('shouldn\'t parse nor transform a method if is not a constructor', () => {
    // Given
    let sut = null;
    const file = {};
    const classMethodPath = {
      getAncestry: jest.fn(),
      node: {
        kind: 'method',
      },
    };
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseClassMethod(classMethodPath);
    sut.transform();
    // Then
    expect(classMethodPath.getAncestry).toHaveBeenCalledTimes(0);
  });

  it('shouldn\'t parse nor transform a method if it doesn\'t have the directive', () => {
    // Given
    let sut = null;
    const file = {};
    const classMethodPath = {
      getAncestry: jest.fn(),
      node: {
        kind: 'constructor',
        body: {
          directives: [],
        },
      },
    };
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseClassMethod(classMethodPath);
    sut.transform();
    // Then
    expect(classMethodPath.getAncestry).toHaveBeenCalledTimes(0);
  });

  it('shouldn\'t parse nor transform a method if can\'t find a parent class', () => {
    // Given
    let sut = null;
    const file = {};
    const ancestorOne = {
      isClassDeclaration: jest.fn(() => false),
      isClassExpression: jest.fn(() => false),
    };
    const ancestorTwo = {
      isClassDeclaration: jest.fn(() => false),
      isClassExpression: jest.fn(() => false),
    };
    const ancestors = [ancestorOne, ancestorTwo];
    const classMethodPath = {
      getAncestry: jest.fn(() => ancestors),
      node: {
        kind: 'constructor',
        body: {
          directives: [{
            value: {
              value: 'inject',
            },
          }],
        },
      },
    };
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseClassMethod(classMethodPath);
    sut.transform();
    // Then
    expect(classMethodPath.getAncestry).toHaveBeenCalledTimes(1);
    expect(ancestorOne.isClassDeclaration).toHaveBeenCalledTimes(1);
    expect(ancestorOne.isClassExpression).toHaveBeenCalledTimes(1);
    expect(ancestorTwo.isClassDeclaration).toHaveBeenCalledTimes(1);
    expect(ancestorTwo.isClassExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledTimes(0);
  });

  it('should parse and transform a function', () => {
    // Given
    babelTypes.isFunctionDeclaration.mockImplementationOnce(() => true);
    babelTypes.isVariableDeclarator.mockImplementationOnce(() => false);
    babelTypes.isExportDeclaration.mockImplementationOnce(() => false);
    babelTypes.isClass.mockImplementationOnce(() => false);
    babelTypes.isFunctionExpression.mockImplementationOnce(() => false);
    babelTypes.isClassMethod.mockImplementationOnce(() => false);
    babelTypes.isNode.mockImplementationOnce(() => true);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.arrayExpression.mockImplementationOnce((list) => list);
    babelTypes.identifier.mockImplementationOnce((prop) => prop);
    babelTypes.memberExpression.mockImplementationOnce((left, right) => ({ left, right }));
    babelTypes.expressionStatement.mockImplementationOnce((exp) => exp);
    babelTypes.assignmentExpression.mockImplementationOnce((operator, name, list) => ({
      operator,
      name,
      list,
    }));
    let sut = null;
    const directive = 'inject';
    const property = 'inject';
    const file = {
      opts: {
        directive,
        property,
      },
    };
    const params = [{ name: 'depOne' }, { name: 'depTwo' }];
    const paramNames = params.map((param) => param.name);
    const binding = {
      kind: 'non-hoisted',
    };
    const functionName = 'myFunc';
    const functionPath = {
      node: {
        start: 3,
        end: 4,
        body: {
          directives: [{
            value: {
              value: directive,
            },
          }],
        },
        id: {
          name: functionName,
        },
        params,
      },
      insertAfter: jest.fn(),
      parent: 'functionParentPath',
      parentPath: {
        scope: {
          crawl: jest.fn(),
        },
      },
      trailingComments: ['something'],
      scope: {
        getBinding: jest.fn(() => binding),
      },
    };
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseFunction(functionPath);
    sut.transform();
    // Then
    expect(babelTypes.isFunctionDeclaration).toHaveBeenCalledTimes(1);
    expect(babelTypes.isFunctionDeclaration).toHaveBeenCalledWith(functionPath.node);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledTimes(1);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledWith(functionPath.node);
    expect(babelTypes.isExportDeclaration).toHaveBeenCalledTimes(1);
    expect(babelTypes.isExportDeclaration).toHaveBeenCalledWith(functionPath.parent);
    expect(babelTypes.isClass).toHaveBeenCalledTimes(1);
    expect(babelTypes.isClass).toHaveBeenCalledWith(functionPath.node);
    expect(babelTypes.isFunctionExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.isFunctionExpression).toHaveBeenCalledWith(functionPath.node);
    expect(functionPath.parentPath.scope.crawl).toHaveBeenCalledTimes(1);
    expect(babelTypes.isNode).toHaveBeenCalledTimes(1);
    expect(babelTypes.isNode).toHaveBeenCalledWith(functionName);
    expect(babelTypes.stringLiteral).toHaveBeenCalledTimes(params.length);
    expect(babelTypes.isAssignmentPattern).toHaveBeenCalledTimes(params.length);
    params.forEach((param) => {
      expect(babelTypes.isAssignmentPattern).toHaveBeenCalledWith(param);
      expect(babelTypes.stringLiteral).toHaveBeenCalledWith(param.name);
    });
    expect(babelTypes.arrayExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.arrayExpression).toHaveBeenCalledWith(paramNames);
    expect(babelTypes.identifier).toHaveBeenCalledTimes(1);
    expect(babelTypes.identifier).toHaveBeenCalledWith(property);
    expect(babelTypes.memberExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.memberExpression).toHaveBeenCalledWith(functionName, property);
    expect(babelTypes.assignmentExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.assignmentExpression).toHaveBeenCalledWith(
      '=',
      {
        left: functionName,
        right: property,
      },
      paramNames
    );
    expect(babelTypes.expressionStatement).toHaveBeenCalledTimes(1);
    expect(babelTypes.expressionStatement).toHaveBeenCalledWith({
      operator: '=',
      name: {
        left: functionName,
        right: property,
      },
      list: paramNames,
    });
    expect(functionPath.insertAfter).toHaveBeenCalledTimes(1);
    expect(functionPath.insertAfter).toHaveBeenCalledWith({
      operator: '=',
      name: {
        left: functionName,
        right: property,
      },
      list: paramNames,
    });
  });

  it('should parse and transform a hoisted function', () => {
    // Given
    babelTypes.isFunctionDeclaration.mockImplementationOnce(() => true);
    babelTypes.isVariableDeclarator.mockImplementationOnce(() => false);
    babelTypes.isExportDeclaration.mockImplementationOnce(() => false);
    babelTypes.isClass.mockImplementationOnce(() => false);
    babelTypes.isFunctionExpression.mockImplementationOnce(() => false);
    babelTypes.isClassMethod.mockImplementationOnce(() => false);
    babelTypes.isNode.mockImplementationOnce(() => true);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.arrayExpression.mockImplementationOnce((list) => list);
    babelTypes.identifier.mockImplementationOnce((prop) => prop);
    babelTypes.memberExpression.mockImplementationOnce((left, right) => ({ left, right }));
    babelTypes.expressionStatement.mockImplementationOnce((exp) => exp);
    babelTypes.assignmentExpression.mockImplementationOnce((operator, name, list) => ({
      operator,
      name,
      list,
    }));
    let sut = null;
    const directive = 'inject';
    const property = 'inject';
    const file = {
      opts: {
        directive,
        property,
      },
    };
    const params = [{ name: 'depOne' }, { name: 'depTwo' }];
    const paramNames = params.map((param) => param.name);
    const bindingParent = {
      path: {
        isFunction: jest.fn(() => false),
        unshiftContainer: jest.fn(),
      },
    };
    const binding = {
      kind: 'hoisted',
      scope: {
        getBlockParent: jest.fn(() => bindingParent),
      },
    };
    const functionName = 'myFunc';
    const functionPath = {
      node: {
        start: 3,
        end: 4,
        body: {
          directives: [{
            value: {
              value: directive,
            },
          }],
        },
        id: {
          name: functionName,
        },
        params,
      },
      insertAfter: jest.fn(),
      parent: 'functionParentPath',
      trailingComments: ['something'],
      scope: {
        getBinding: jest.fn(() => binding),
      },
    };
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseFunction(functionPath);
    sut.transform();
    // Then
    expect(binding.scope.getBlockParent).toHaveBeenCalledTimes(1);
    expect(bindingParent.path.isFunction).toHaveBeenCalledTimes(1);
    expect(bindingParent.path.unshiftContainer).toHaveBeenCalledTimes(1);
    expect(bindingParent.path.unshiftContainer).toHaveBeenCalledWith('body', [{
      operator: '=',
      name: {
        left: functionName,
        right: property,
      },
      list: paramNames,
    }]);
  });

  it('should parse and transform a hoisted function that is inside another function', () => {
    // Given
    babelTypes.isFunctionDeclaration.mockImplementationOnce(() => true);
    babelTypes.isVariableDeclarator.mockImplementationOnce(() => false);
    babelTypes.isExportDeclaration.mockImplementationOnce(() => false);
    babelTypes.isClass.mockImplementationOnce(() => false);
    babelTypes.isFunctionExpression.mockImplementationOnce(() => false);
    babelTypes.isClassMethod.mockImplementationOnce(() => false);
    babelTypes.isNode.mockImplementationOnce(() => true);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.arrayExpression.mockImplementationOnce((list) => list);
    babelTypes.identifier.mockImplementationOnce((prop) => prop);
    babelTypes.memberExpression.mockImplementationOnce((left, right) => ({ left, right }));
    babelTypes.expressionStatement.mockImplementationOnce((exp) => exp);
    babelTypes.assignmentExpression.mockImplementationOnce((operator, name, list) => ({
      operator,
      name,
      list,
    }));
    let sut = null;
    const directive = 'inject';
    const property = 'inject';
    const file = {
      opts: {
        directive,
        property,
      },
    };
    const params = [{ name: 'depOne' }, { name: 'depTwo' }];
    const paramNames = params.map((param) => param.name);
    const bindingParentParent = {
      unshiftContainer: jest.fn(),
    };
    const bindingParent = {
      path: {
        isFunction: jest.fn(() => true),
        get: jest.fn(() => bindingParentParent),
      },
    };
    const binding = {
      kind: 'hoisted',
      scope: {
        getBlockParent: jest.fn(() => bindingParent),
      },
    };
    const functionName = 'myFunc';
    const functionPath = {
      node: {
        start: 3,
        end: 4,
        body: {
          directives: [{
            value: {
              value: directive,
            },
          }],
        },
        id: {
          name: functionName,
        },
        params,
      },
      insertAfter: jest.fn(),
      parent: 'functionParentPath',
      trailingComments: ['something'],
      scope: {
        getBinding: jest.fn(() => binding),
      },
    };
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseFunction(functionPath);
    sut.transform();
    // Then
    expect(binding.scope.getBlockParent).toHaveBeenCalledTimes(1);
    expect(bindingParent.path.isFunction).toHaveBeenCalledTimes(1);
    expect(bindingParent.path.get).toHaveBeenCalledTimes(1);
    expect(bindingParent.path.get).toHaveBeenCalledWith('body');
    expect(bindingParentParent.unshiftContainer).toHaveBeenCalledTimes(1);
    expect(bindingParentParent.unshiftContainer).toHaveBeenCalledWith('body', [{
      operator: '=',
      name: {
        left: functionName,
        right: property,
      },
      list: paramNames,
    }]);
  });

  it('shouldn\'t parse nor transform a function if it doesn\'t have the directive', () => {
    // Given
    let sut = null;
    const file = {};
    const functionPath = {
      node: {
        body: {
          directives: [],
        },
      },
    };
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseFunction(functionPath);
    sut.transform();
    // Then
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledTimes(0);
  });

  it('shouldn\'t parse nor transform an arrow function', () => {
    // Given
    babelTypes.isFunctionDeclaration.mockImplementationOnce(() => false);
    babelTypes.isVariableDeclarator.mockImplementationOnce(() => false);
    let sut = null;
    const file = {};
    const functionPath = {
      node: {
        body: {
          directives: [{
            value: {
              value: 'inject',
            },
          }],
        },
      },
      parent: 'parentPath',
    };
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseFunction(functionPath);
    sut.transform();
    // Then
    expect(babelTypes.isFunctionDeclaration).toHaveBeenCalledTimes(1);
    expect(babelTypes.isFunctionDeclaration).toHaveBeenCalledWith(functionPath.node);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledTimes(1);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledWith(functionPath.parent);
    expect(babelTypes.isExportDeclaration).toHaveBeenCalledTimes(0);
  });

  it('should parse and transform a variable function', () => {
    // Given
    babelTypes.isFunctionDeclaration.mockImplementationOnce(() => false);
    babelTypes.isVariableDeclarator.mockImplementationOnce(() => true);
    babelTypes.isVariableDeclarator.mockImplementationOnce(() => false);
    babelTypes.isExportDeclaration.mockImplementationOnce(() => false);
    babelTypes.isClass.mockImplementationOnce(() => false);
    babelTypes.isFunctionExpression.mockImplementationOnce(() => false);
    babelTypes.isClassMethod.mockImplementationOnce(() => false);
    babelTypes.isNode.mockImplementationOnce(() => false);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.arrayExpression.mockImplementationOnce((list) => list);
    babelTypes.identifier.mockImplementationOnce((prop) => prop);
    babelTypes.identifier.mockImplementationOnce((prop) => prop);
    babelTypes.memberExpression.mockImplementationOnce((left, right) => ({ left, right }));
    babelTypes.expressionStatement.mockImplementationOnce((exp) => exp);
    babelTypes.assignmentExpression.mockImplementationOnce((operator, name, list) => ({
      operator,
      name,
      list,
    }));
    let sut = null;
    const directive = 'inject';
    const property = 'inject';
    const file = {
      opts: {
        directive,
        property,
      },
    };
    const params = [{ name: 'depOne' }, { name: 'depTwo' }];
    const paramNames = params.map((param) => param.name);
    const binding = {
      kind: 'non-hoisted',
    };

    const variableName = 'myFunc';
    const variablePath = {
      insertAfter: jest.fn(),
      node: {
        start: 3,
        end: 4,
        params,
        id: {
          name: variableName,
        },
      },
      parent: 'variableParentPath',
      parentPath: {
        scope: {
          crawl: jest.fn(),
        },
      },
      scope: {
        getBinding: jest.fn(() => binding),
      },
      trailingComments: ['something'],
    };

    const functionPath = {
      node: {
        body: {
          directives: [{
            value: {
              value: directive,
            },
          }],
        },
      },
      parent: 'functionPathParent',
      parentPath: variablePath,
    };
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseFunction(functionPath);
    sut.transform();
    // Then
    expect(babelTypes.isFunctionDeclaration).toHaveBeenCalledTimes(1);
    expect(babelTypes.isFunctionDeclaration).toHaveBeenCalledWith(functionPath.node);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledTimes(2);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledWith(functionPath.parent);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledWith(variablePath.node);
    expect(babelTypes.isExportDeclaration).toHaveBeenCalledTimes(1);
    expect(babelTypes.isExportDeclaration).toHaveBeenCalledWith(variablePath.parent);
    expect(babelTypes.isClass).toHaveBeenCalledTimes(1);
    expect(babelTypes.isClass).toHaveBeenCalledWith(variablePath.node);
    expect(babelTypes.isFunctionExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.isFunctionExpression).toHaveBeenCalledWith(variablePath.node);
    expect(variablePath.parentPath.scope.crawl).toHaveBeenCalledTimes(1);
    expect(babelTypes.isNode).toHaveBeenCalledTimes(1);
    expect(babelTypes.isNode).toHaveBeenCalledWith(variableName);
    expect(babelTypes.stringLiteral).toHaveBeenCalledTimes(params.length);
    expect(babelTypes.isAssignmentPattern).toHaveBeenCalledTimes(params.length);
    params.forEach((param) => {
      expect(babelTypes.isAssignmentPattern).toHaveBeenCalledWith(param);
      expect(babelTypes.stringLiteral).toHaveBeenCalledWith(param.name);
    });
    expect(babelTypes.arrayExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.arrayExpression).toHaveBeenCalledWith(paramNames);
    expect(babelTypes.identifier).toHaveBeenCalledTimes(2);
    expect(babelTypes.identifier).toHaveBeenCalledWith(variableName);
    expect(babelTypes.identifier).toHaveBeenCalledWith(property);
    expect(babelTypes.memberExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.memberExpression).toHaveBeenCalledWith(variableName, property);
    expect(babelTypes.assignmentExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.assignmentExpression).toHaveBeenCalledWith(
      '=',
      {
        left: variableName,
        right: property,
      },
      paramNames
    );
    expect(babelTypes.expressionStatement).toHaveBeenCalledTimes(1);
    expect(babelTypes.expressionStatement).toHaveBeenCalledWith({
      operator: '=',
      name: {
        left: variableName,
        right: property,
      },
      list: paramNames,
    });
    expect(variablePath.insertAfter).toHaveBeenCalledTimes(1);
    expect(variablePath.insertAfter).toHaveBeenCalledWith({
      operator: '=',
      name: {
        left: variableName,
        right: property,
      },
      list: paramNames,
    });
  });

  it('should parse and transform a variable function that is being exported', () => {
    // Given
    babelTypes.isFunctionDeclaration.mockImplementationOnce(() => false);
    babelTypes.isVariableDeclarator.mockImplementationOnce(() => true);
    babelTypes.isVariableDeclarator.mockImplementationOnce(() => true);
    babelTypes.isExportDeclaration.mockImplementationOnce(() => true);
    babelTypes.isClass.mockImplementationOnce(() => false);
    babelTypes.isFunctionExpression.mockImplementationOnce(() => false);
    babelTypes.isClassMethod.mockImplementationOnce(() => false);
    babelTypes.isNode.mockImplementationOnce(() => false);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.isAssignmentPattern.mockImplementationOnce(() => false);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.stringLiteral.mockImplementationOnce((name) => name);
    babelTypes.arrayExpression.mockImplementationOnce((list) => list);
    babelTypes.identifier.mockImplementationOnce((prop) => prop);
    babelTypes.identifier.mockImplementationOnce((prop) => prop);
    babelTypes.memberExpression.mockImplementationOnce((left, right) => ({ left, right }));
    babelTypes.expressionStatement.mockImplementationOnce((exp) => exp);
    babelTypes.assignmentExpression.mockImplementationOnce((operator, name, list) => ({
      operator,
      name,
      list,
    }));
    let sut = null;
    const directive = 'inject';
    const property = 'inject';
    const file = {
      opts: {
        directive,
        property,
      },
    };
    const params = [{ name: 'depOne' }, { name: 'depTwo' }];
    const paramNames = params.map((param) => param.name);
    const binding = {
      kind: 'non-hoisted',
    };

    const exportPath = {
      parentPath: {
        scope: {
          crawl: jest.fn(),
        },
      },
      scope: {
        getBinding: jest.fn(() => binding),
      },
      trailingComments: ['something'],
      insertAfter: jest.fn(),
    };

    const variableName = 'myFunc';
    const variablePath = {
      node: {
        start: 3,
        end: 4,
        id: {
          name: variableName,
        },
        init: {
          params,
          id: {
            name: variableName,
          },
        },
      },
      parent: 'variableParentPath',
      parentPath: {
        parent: 'parent-parent-parent',
      },
      get: jest.fn(() => exportPath),
    };

    const functionPath = {
      node: {
        body: {
          directives: [{
            value: {
              value: directive,
            },
          }],
        },
      },
      parent: 'functionPathParent',
      parentPath: variablePath,
    };
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseFunction(functionPath);
    sut.transform();
    // Then
    expect(babelTypes.isFunctionDeclaration).toHaveBeenCalledTimes(1);
    expect(babelTypes.isFunctionDeclaration).toHaveBeenCalledWith(functionPath.node);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledTimes(2);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledWith(functionPath.parent);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledWith(variablePath.node);
    expect(babelTypes.isExportDeclaration).toHaveBeenCalledTimes(1);
    expect(babelTypes.isExportDeclaration).toHaveBeenCalledWith(variablePath.parentPath.parent);
    expect(babelTypes.isClass).toHaveBeenCalledTimes(1);
    expect(babelTypes.isClass).toHaveBeenCalledWith(variablePath.node.init);
    expect(babelTypes.isFunctionExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.isFunctionExpression).toHaveBeenCalledWith(variablePath.node.init);
    expect(exportPath.parentPath.scope.crawl).toHaveBeenCalledTimes(1);
    expect(babelTypes.isNode).toHaveBeenCalledTimes(1);
    expect(babelTypes.isNode).toHaveBeenCalledWith(variableName);
    expect(babelTypes.stringLiteral).toHaveBeenCalledTimes(params.length);
    expect(babelTypes.isAssignmentPattern).toHaveBeenCalledTimes(params.length);
    params.forEach((param) => {
      expect(babelTypes.isAssignmentPattern).toHaveBeenCalledWith(param);
      expect(babelTypes.stringLiteral).toHaveBeenCalledWith(param.name);
    });
    expect(babelTypes.arrayExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.arrayExpression).toHaveBeenCalledWith(paramNames);
    expect(babelTypes.identifier).toHaveBeenCalledTimes(2);
    expect(babelTypes.identifier).toHaveBeenCalledWith(variableName);
    expect(babelTypes.identifier).toHaveBeenCalledWith(property);
    expect(babelTypes.memberExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.memberExpression).toHaveBeenCalledWith(variableName, property);
    expect(babelTypes.assignmentExpression).toHaveBeenCalledTimes(1);
    expect(babelTypes.assignmentExpression).toHaveBeenCalledWith(
      '=',
      {
        left: variableName,
        right: property,
      },
      paramNames
    );
    expect(babelTypes.expressionStatement).toHaveBeenCalledTimes(1);
    expect(babelTypes.expressionStatement).toHaveBeenCalledWith({
      operator: '=',
      name: {
        left: variableName,
        right: property,
      },
      list: paramNames,
    });
    expect(exportPath.insertAfter).toHaveBeenCalledTimes(1);
    expect(exportPath.insertAfter).toHaveBeenCalledWith({
      operator: '=',
      name: {
        left: variableName,
        right: property,
      },
      list: paramNames,
    });
  });

  it('shouldn\'t transform a function without parameters', () => {
    // Given
    babelTypes.isFunctionDeclaration.mockImplementationOnce(() => true);
    babelTypes.isFunctionDeclaration.mockImplementationOnce(() => true);
    babelTypes.isVariableDeclarator.mockImplementationOnce(() => false);
    babelTypes.isExportDeclaration.mockImplementationOnce(() => false);
    babelTypes.isClass.mockImplementationOnce(() => false);
    let sut = null;
    const directive = 'inject';
    const property = 'inject';
    const file = {
      opts: {
        directive,
        property,
      },
    };
    const params = [];
    const functionPath = {
      node: {
        start: 3,
        end: 4,
        body: {
          directives: [{
            value: {
              value: directive,
            },
          }],
        },
        params,
      },
      parent: 'functionParentPath',
    };
    // When
    sut = new InjectDirectiveParser(file);
    sut.parseFunction(functionPath);
    sut.transform();
    // Then
    expect(babelTypes.isFunctionDeclaration).toHaveBeenCalledTimes(1);
    expect(babelTypes.isFunctionDeclaration).toHaveBeenCalledWith(functionPath.node);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledTimes(1);
    expect(babelTypes.isVariableDeclarator).toHaveBeenCalledWith(functionPath.node);
    expect(babelTypes.isExportDeclaration).toHaveBeenCalledTimes(1);
    expect(babelTypes.isExportDeclaration).toHaveBeenCalledWith(functionPath.parent);
    expect(babelTypes.isClass).toHaveBeenCalledTimes(1);
    expect(babelTypes.isClass).toHaveBeenCalledWith(functionPath.node);
    expect(babelTypes.isFunctionExpression).toHaveBeenCalledTimes(0);
  });
});

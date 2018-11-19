jest.unmock('/src/index');
require('jasmine-expect');
const InjectDirectiveParser = require('/src/injectDirectiveParser');
const plugin = require('/src/index');

describe('plugin', () => {
  beforeEach(() => {
    InjectDirectiveParser.mockReset();
  });

  it('should return the visitor objects', () => {
    // Given
    let sut = null;
    // When
    sut = plugin();
    // Then
    expect(sut).toBeObject();
    expect(sut).toEqual({
      visitor: {
        ClassMethod: {
          enter: expect.any(Function),
        },
        FunctionDeclaration: {
          enter: expect.any(Function),
        },
        FunctionExpression: {
          enter: expect.any(Function),
        },
        Program: {
          enter: expect.any(Function),
          exit: expect.any(Function),
        },
      },
    });
  });

  it('should create an instance of the parser when the Program is visited', () => {
    // Given
    const file = 'program-file';
    // When
    plugin().visitor.Program.enter('wathever', file);
    // Then
    expect(InjectDirectiveParser).toHaveBeenCalledTimes(1);
    expect(InjectDirectiveParser).toHaveBeenCalledWith(file);
  });

  it('should call the parser transform method when the Program exits', () => {
    // Given
    let sut = null;
    const file = 'program-file';
    // When
    sut = plugin().visitor.Program;
    sut.enter('wathever', file);
    sut.exit();
    // Then
    expect(InjectDirectiveParser).toHaveBeenCalledTimes(1);
    expect(InjectDirectiveParser).toHaveBeenCalledWith(file);
    expect(InjectDirectiveParser.mock.instances[0].transform).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if the `Program` exits before being visited', () => {
    // Given/When/Then
    expect(() => plugin().visitor.Program.exit())
    .toThrow(/`Program.exit` can't be called before `Program.enter`/i);
  });

  it('should parse a class method when `ClassMethod` is visited', () => {
    // Given
    let sut = null;
    const path = 'class-method-path';
    // When
    sut = plugin().visitor;
    sut.Program.enter('hello', 'charito');
    sut.ClassMethod.enter(path);
    // Then
    expect(InjectDirectiveParser.mock.instances[0].parseClassMethod).toHaveBeenCalledTimes(1);
    expect(InjectDirectiveParser.mock.instances[0].parseClassMethod).toHaveBeenCalledWith(path);
  });

  it('should throw an error if `ClassMethod` is visited before the `Program`', () => {
    // Given/When/Then
    expect(() => plugin().visitor.ClassMethod.enter())
    .toThrow(/`ClassMethod.enter` can't be called before `Program.enter`/i);
  });

  it('should parse a class method when `FunctionDeclaration` is visited', () => {
    // Given
    let sut = null;
    const path = 'function-declaration-path';
    // When
    sut = plugin().visitor;
    sut.Program.enter('hello', 'charito');
    sut.FunctionDeclaration.enter(path);
    // Then
    expect(InjectDirectiveParser.mock.instances[0].parseFunction).toHaveBeenCalledTimes(1);
    expect(InjectDirectiveParser.mock.instances[0].parseFunction).toHaveBeenCalledWith(path);
  });

  it('should throw an error if `FunctionDeclaration` is visited before the `Program`', () => {
    // Given/When/Then
    expect(() => plugin().visitor.FunctionDeclaration.enter())
    .toThrow(/`FunctionDeclaration.enter` can't be called before `Program.enter`/i);
  });

  it('should parse a class method when `FunctionExpression` is visited', () => {
    // Given
    let sut = null;
    const path = 'function-expression-path';
    // When
    sut = plugin().visitor;
    sut.Program.enter('hello', 'charito');
    sut.FunctionExpression.enter(path);
    // Then
    expect(InjectDirectiveParser.mock.instances[0].parseFunction).toHaveBeenCalledTimes(1);
    expect(InjectDirectiveParser.mock.instances[0].parseFunction).toHaveBeenCalledWith(path);
  });

  it('should throw an error if `FunctionExpression` is visited before the `Program`', () => {
    // Given/When/Then
    expect(() => plugin().visitor.FunctionExpression.enter())
    .toThrow(/`FunctionExpression.enter` can't be called before `Program.enter`/i);
  });
});

describe('evalOpts', function () {
  it('should return same object for non functions', function() {
    var obj = {};
    expect(evalOpts(obj)).toBe(obj);
  });
  it('should return same type for non functions', function() {
    expect(evalOpts(5)).toBe(5);
  });
  it('should evaluate function', function() {
    expect(evalOpts(function () {return 5;})).toBe(5);
  });
  it('should evaluate function with given arguments', function() {
    var obj = {};
    expect(evalOpts(function (a) {return a;}, obj)).toBe(obj);
  });
});
describe('events', function() {
  /**
   * @type {Flow}
   */
  var flow;

  beforeEach(function () {
    flow = new Flow();
  });

  it('should catch all events', function() {
    var valid = false;
    flow.on('catchall', function (event) {
      expect(event).toBe('test');
      valid = true;
    });
    flow.fire('test');
    expect(valid).toBeTruthy();
  });

  it('should catch an event', function() {
    var valid = false;
    flow.on('test', function () {
      valid = true;
    });
    flow.fire('test');
    expect(valid).toBeTruthy();
  });

  it('should pass some arguments', function() {
    var valid = false;
    var argumentOne = 123;
    var argumentTwo = "dqw";
    flow.on('test', function () {
      expect(arguments.length).toBe(2);
      expect(arguments[0]).toBe(argumentOne);
      expect(arguments[1]).toBe(argumentTwo);
      expect(arguments[2]).toBeUndefined();
      valid = true;
    });
    flow.fire('test', argumentOne, argumentTwo);
    expect(valid).toBeTruthy();
  });

  it('should return event value', function() {
    flow.on('false', function () {
      return false;
    });
    flow.on('true', function () {

    });
    expect(flow.fire('true')).toBeTruthy();
    expect(flow.fire('not existant')).toBeTruthy();
    expect(flow.fire('false')).toBeFalsy();
  });

  it('should return multiple event value', function() {
    flow.on('maybe', function () {
      return false;
    });
    flow.on('maybe', function () {

    });
    expect(flow.fire('maybe')).toBeFalsy();

    flow.on('maybe2', function () {

    });
    flow.on('maybe2', function () {
      return false;
    });
    expect(flow.fire('maybe2')).toBeFalsy();
  });
});
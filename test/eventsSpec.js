describe('events', function() {
  /**
   * @type {Flow}
   */
  var flow;

  beforeEach(function () {
    flow = new Flow();
  });

  it('should catch an event', function() {
    var valid = false;
    flow.on('test', function () {
      valid = true;
    });
    flow.fire('test');
    expect(valid).toBeTruthy();
  });

  it('should have a context of flow instance', function() {
    var context = null;
    flow.on('test', function () {
      context = this;
    });
    flow.fire('test');
    expect(context).toEqual(flow);
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

  it('should throw catchall event last', function() {
    var executed = 0;
    flow.on('catchall', function (event, one) {
      expect(event).toBe('test');
      expect(one).toBe(1);
      expect(executed).toBe(1);
      executed++;
    });
    flow.on('test', function (one) {
      expect(one).toBe(1);
      expect(executed).toBe(0);
      executed++;
    });
    flow.fire('test', 1);
    expect(executed).toBe(2);
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

  describe('off', function () {
    var event;
    beforeEach(function () {
      event = jasmine.createSpy('event');
      flow.on('event', event);
    });
    it('should remove event', function () {
      flow.off('event');
      flow.fire('event');
      expect(event).not.toHaveBeenCalled();
    });
    it('should remove specific event', function () {
      flow.off('event', event);
      flow.fire('event');
      expect(event).not.toHaveBeenCalled();
    });
    it('should remove all events', function () {
      flow.off();
      flow.fire('event');
      expect(event).not.toHaveBeenCalled();
    });
  });
});

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
    flow.on('test', () => {
      valid = true;
    });
    flow.emit('test');
    expect(valid).toBeTruthy();
  });

  it('should have a context of flow instance', function() {
    var context = null;
    flow.on('test', function () {
      context = this;
    });
    flow.emit('test');
    expect(context).toEqual(flow);
  });

  it('should pass some arguments', function() {
    var valid = false;
    var argumentOne = 123;
    var argumentTwo = "dqw";
    flow.on('test', function ({detail: [...arguments]}) {
      expect(arguments.length).toBe(2);
      expect(arguments[0]).toBe(argumentOne);
      expect(arguments[1]).toBe(argumentTwo);
      expect(arguments[2]).toBeUndefined();
      valid = true;
    });
    flow.emit('test', argumentOne, argumentTwo);
    expect(valid).toBeTruthy();
  });

  it('should throw catchall event last', function() {
    var executed = 0;
    flow.on('catch-all', function ({detail: [event, one, ...args]}) {
      expect(event).toBe('test');
      expect(one).toBe(1);
      expect(executed).toBe(1);
      executed++;
    });
    flow.on('test', ({detail: [one]}) => {
      expect(one).toBe(1);
      expect(executed).toBe(0);
      executed++;
    });
    flow.emit('test', 1);
    expect(executed).toBe(2);
  });

  it('should not return event value', async function() {
    flow.on('false', () => false);
    flow.on('true', () => true);

    expect(flow.emit('true')).toEqual(jasmine.any(Promise));
    // Native event does not provide their event value and
    // are fully sent in a fully asynchronous way.
    await expectAsync(flow.emit('true')).toBeResolvedTo(undefined);
    await expectAsync(flow.emit('not existant')).toBeResolvedTo(undefined);
    await expectAsync(flow.emit('false')).toBeResolvedTo(undefined);
  });

  it('should run all event handlers', function() {
    var customFunction = jasmine.createSpy('fn');
    flow.on('maybe', () => customFunction(1));
    flow.on('maybe', () => customFunction(2));
    flow.emit('maybe', 1);
    expect(customFunction).toHaveBeenCalledTimes(2);
  });

  describe('off', function () {
    var event, unbinder;
    beforeEach(function () {
      event = jasmine.createSpy('event');
      unbinder = flow.on('event', event);
    });
    it('should remove event', function () {
      flow.off('event');
      flow.emit('event');
      expect(event).not.toHaveBeenCalled();
    });
    it('should remove event', function () {
      console.log(unbinder);
      unbinder();
      flow.emit('event');
      expect(event).not.toHaveBeenCalled();
    });
    it('should remove specific event', function () {
      flow.off('event', event);
      flow.emit('event');
      expect(event).not.toHaveBeenCalled();
    });
    it('should remove all events', function () {
      flow.off();
      flow.emit('event');
      expect(event).not.toHaveBeenCalled();
    });
  });

  describe('once', function () {
    var event;
    it('should just once', function () {
      event = jasmine.createSpy('event');
      flow.once('event', event);
      flow.emit('event');
      flow.emit('event');
      expect(event).toHaveBeenCalledTimes(1);
    });

    it('should warn that once() is not supported for hooks', function () {
      spyOn(console, 'warn');
      event = jasmine.createSpy('files-added');
      flow.once('files-added', event);
      expect(console.warn).toHaveBeenCalled();
    });
  });
});

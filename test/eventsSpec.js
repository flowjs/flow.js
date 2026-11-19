describe('events', function() {
  var flow;

  beforeEach(function() {
    flow = new Flow();
  });

  it('should dispatch a native event with object detail', function() {
    var received = null;
    flow.addEventListener('test', function(event) {
      received = event;
    });
    flow._emit('test', {one: 123, two: 'dqw'});

    expect(received).not.toBeNull();
    expect(received.type).toBe('test');
    expect(received.detail.type).toBe('test');
    expect(received.detail.flow).toBe(flow);
    expect(received.detail.one).toBe(123);
    expect(received.detail.two).toBe('dqw');
  });

  it('should have flow as the listener context', function() {
    var context = null;
    flow.addEventListener('test', function() {
      context = this;
    });
    flow._emit('test');
    expect(context).toBe(flow);
  });

  it('should throw catch-all last', function() {
    var executed = 0;
    flow.addEventListener('catch-all', function(event) {
      expect(event.detail.type).toBe('test');
      expect(event.detail.hook).toBe(false);
      expect(event.detail.detail.one).toBe(1);
      expect(executed).toBe(1);
      executed++;
    });
    flow.addEventListener('test', function(event) {
      expect(event.detail.one).toBe(1);
      expect(executed).toBe(0);
      executed++;
    });
    flow._emit('test', {one: 1});
    expect(executed).toBe(2);
  });

  it('should not return listener values', function() {
    flow.addEventListener('false', function() { return false; });
    flow.addEventListener('true', function() { return true; });

    var result = flow._emit('true');
    expect(result).toEqual(jasmine.objectContaining({type: 'true', flow: flow}));
    flow._emit('not existent');
    flow._emit('false');
  });

  it('should run all event handlers', function() {
    var customFunction = jasmine.createSpy('fn');
    flow.addEventListener('maybe', function() { customFunction(1); });
    flow.addEventListener('maybe', function() { customFunction(2); });
    flow._emit('maybe', {value: 1});
    expect(customFunction).toHaveBeenCalledTimes(2);
  });

  it('should be case-sensitive', function() {
    var customEvent = jasmine.createSpy('custom');
    flow.addEventListener('_CusTom', customEvent);
    flow._emit('_custom');
    expect(customEvent).not.toHaveBeenCalled();
  });

  describe('removeEventListener', function() {
    it('should remove an event', function() {
      var event = jasmine.createSpy('event');
      flow.addEventListener('event', event);
      flow.removeEventListener('event', event);
      flow._emit('event');
      expect(event).not.toHaveBeenCalled();
    });
  });

  describe('once', function() {
    it('should run only once', function() {
      var event = jasmine.createSpy('event');
      flow.addEventListener('event', event, {once: true});
      flow._emit('event');
      flow._emit('event');
      expect(event).toHaveBeenCalledTimes(1);
    });
  });
});

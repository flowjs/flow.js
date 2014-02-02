describe('events', function() {
  var on, off, fire;
  beforeEach(function () {
    var event = events();
    on = event.on;
    off = event.off;
    fire = event.fire;
  });
  it('should catch an event', function() {
    var callback = jasmine.createSpy();
    on('test', callback);
    fire('test');
    expect(callback).toHaveBeenCalled();
  });

  it('should pass some arguments', function() {
    var argumentOne = 123;
    var argumentTwo = "dqw";
    var callback = jasmine.createSpy('test');
    on('test', callback);
    var event = fire('test', argumentOne, argumentTwo);
    expect(callback).toHaveBeenCalledWith(event, argumentOne, argumentTwo);
  });

  it('should return event value', function() {
    on('prevent', function (event) {
      event.preventDefault();
    });
    on('noop', function () {

    });
    expect(fire('noop').defaultPrevented).toBeFalsy();
    expect(fire('not existant').defaultPrevented).toBeFalsy();
    expect(fire('prevent').defaultPrevented).toBeTruthy();
  });

  it('should return multiple event value', function() {
    on('maybe', function (event) {
      event.preventDefault();
    });
    on('maybe', function () {

    });
    expect(fire('maybe').defaultPrevented).toBeTruthy();
    // opposite order
    on('maybe2', function () {

    });
    on('maybe2', function (event) {
      event.preventDefault();
    });
    expect(fire('maybe2').defaultPrevented).toBeTruthy();
  });

  describe('off', function () {
    var event;
    beforeEach(function () {
      event = jasmine.createSpy('event');
      on('event', event);
    });
    it('should remove event', function () {
      off('event');
      fire('event');
      expect(event).not.toHaveBeenCalled();
    });
    it('should remove specific event', function () {
      off('event', event);
      fire('event');
      expect(event).not.toHaveBeenCalled();
    });
    it('should remove all events', function () {
      off();
      fire('event');
      expect(event).not.toHaveBeenCalled();
    });
  });
});
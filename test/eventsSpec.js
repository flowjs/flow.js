describe('events', function() {
  it('should catch an event', function() {
    var callback = jasmine.createSpy();
    on('test', callback);
    fire('test');
    expect(callback).toHaveBeenCalled();
  });

  it('should pass some arguments', function() {
    var argumentOne = 123;
    var argumentTwo = "dqw";
    var callback = jasmine.createSpy();
    on('test', callback);
    fire('test', argumentOne, argumentTwo);
    expect(callback).toHaveBeenCalledWith(argumentOne, argumentTwo);
  });

  it('should return event value', function() {
    on('false', function () {
      return false;
    });
    on('true', function () {

    });
    expect(fire('true')).toBeTruthy();
    expect(fire('not existant')).toBeTruthy();
    expect(fire('false')).toBeFalsy();
  });

  it('should return multiple event value', function() {
    on('maybe', function () {
      return false;
    });
    on('maybe', function () {

    });
    expect(fire('maybe')).toBeFalsy();
    // opposite order
    on('maybe2', function () {

    });
    on('maybe2', function () {
      return false;
    });
    expect(fire('maybe2')).toBeFalsy();
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
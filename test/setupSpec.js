describe('setup', function() {
  /**
   * @type {Flow}
   */
  var flow;

  beforeEach(function () {
    flow = new Flow({
      generateUniqueIdentifier: function (file) {
        return file.size;
      }
    });
  });

  it('files should be empty', function() {
    expect(flow.files).toBeDefined();
    expect(flow.files.length).toBe(0);
  });

  it('should be an EventTarget', function() {
    expect(flow instanceof EventTarget).toBe(true);
    var called = false;
    flow.addEventListener('probe', function() { called = true; });
    flow._emit('probe');
    expect(called).toBe(true);
  });

  it('set opts', function() {
    flow = new Flow({
      chunkSize: 123
    });
    expect(flow.opts.chunkSize).toBe(123);
    expect(flow.opts.simultaneousUploads).toBe(flow.defaults.simultaneousUploads);
  });

  it('should show methods initial state', async function() {
    expect(flow.progress()).toBe(0);
    expect(flow.isUploading()).toBe(false);
    expect(flow.timeRemaining()).toBe(0);
    expect(flow.sizeUploaded()).toBe(0);
  });

  it('should return total files size', async function() {
    expect(flow.getSize()).toBe(0);
    await flow.addFile(new Blob(['1234']));
    expect(flow.getSize()).toBe(4);
    await flow.addFile(new Blob(['123']));
    expect(flow.getSize()).toBe(7);
  });

  it('should find file by identifier', async function() {
    expect(flow.getFromUniqueIdentifier('')).toBe(false);
    await flow.addFile(new Blob(['1234']));
    expect(flow.getFromUniqueIdentifier(4)).toBe(flow.files[0]);
  });

  it('dispatches events registered with addEventListener', function() {
    var customEvent = jasmine.createSpy('customEventHandler');
    var f = new Flow();
    f.addEventListener('_custom', customEvent);
    f._emit('_custom');
    expect(customEvent).toHaveBeenCalledTimes(1);
  });

  it('event names are case-sensitive', function() {
    var customEvent = jasmine.createSpy('customEventHandler');
    var f = new Flow();
    f.addEventListener('_CusTom', customEvent);
    f._emit('_custom');
    expect(customEvent).not.toHaveBeenCalled();
  });

  describe('assignBrowse', function() {
    it('assign to input', function() {
      var input = document.createElement('input');
      var addFiles = jasmine.createSpy('addFiles');
      flow.addFiles = addFiles;
      input.type = 'file';
      flow.assignBrowse(input);
      expect(input.hasAttribute('multiple')).toBeTruthy();
      expect(addFiles).not.toHaveBeenCalled();
      var event = document.createEvent('MouseEvents');
      event.initEvent('change', true, true);
      input.dispatchEvent(event);
      expect(addFiles).not.toHaveBeenCalled();
    });

    it('assign to div', function() {
      var div = document.createElement('div');
      var addFiles = jasmine.createSpy('addFiles');
      flow.addFiles = addFiles;
      flow.assignBrowse(div);
      expect(div.children.length).toBe(1);
      var input = div.children[0];
      expect(addFiles).not.toHaveBeenCalled();
      var event = document.createEvent('MouseEvents');
      event.initEvent('change', true, true);
      input.dispatchEvent(event);
      expect(addFiles).not.toHaveBeenCalled();
    });

    it('single file', function() {
      var input = document.createElement('input');
      input.type = 'file';
      flow.assignBrowse(input, false, true);
      expect(input.hasAttribute('multiple')).toBeFalsy();
    });

    it('directory', function() {
      var input = document.createElement('input');
      input.type = 'file';
      flow.assignBrowse(input, true);
      expect(input.hasAttribute('webkitdirectory')).toBeTruthy();
    });
  });

  describe('assignDrop', function() {
    it('assign to div', function() {
      var div = document.createElement('div'),
          event = document.createEvent('MouseEvents');
      event.initEvent('drop', true, true);
      event.dataTransfer = {files: []};

      spyOn(flow, 'onDrop').and.callThrough();
      flow.assignDrop(div);
      div.dispatchEvent(event);
      expect(flow.onDrop).toHaveBeenCalledTimes(1);

      flow.unAssignDrop(div);
      div.dispatchEvent(event);
      expect(flow.onDrop).toHaveBeenCalledTimes(1);
    });
  });

  it('detects directory support from the input element', function() {
    var input = document.createElement('input');
    var expected = 'webkitdirectory' in input ||
      'mozdirectory' in input ||
      'odirectory' in input ||
      'msdirectory' in input ||
      'directory' in input;
    expect(flow.supportDirectory).toBe(expected);
  });

});

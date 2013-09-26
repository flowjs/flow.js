describe('setup', function() {
  /**
   * @type {Resumable}
   */
  var resumable;

  beforeEach(function () {
    resumable = new Resumable();
  });

  it('should be supported', function() {
    expect(resumable.support).toBeTruthy();
  });

  it('files should be empty', function() {
    expect(resumable.files).toBeDefined();
    expect(resumable.files.length).toBe(0);
  });

  it('events should be empty', function() {
    expect(resumable.events).toBeDefined();
    expect(resumable.events.length).toBe(0);
  });

  it('set opts', function() {
    resumable = new Resumable({
      chunkSize: 123
    });
    expect(resumable.opts.chunkSize).toBe(123);
    expect(resumable.opts.simultaneousUploads).toBe(resumable.defaults.simultaneousUploads);
  });

  it('test methods', function() {
    expect(resumable.getSize()).toBe(0);
    expect(resumable.getFromUniqueIdentifier('')).toBe(false);
    expect(resumable.progress()).toBe(0);
    expect(resumable.isUploading()).toBe(false);
    expect(resumable.uploadNextChunk()).toBe(false);
  });

  describe('assignBrowse', function() {
    it('assign to input', function() {
      var input = document.createElement('input');
      var addFiles = jasmine.createSpy('addFiles');
      resumable.addFiles = addFiles;
      input.type = 'file';
      resumable.assignBrowse(input);
      expect(input.hasAttribute('multiple')).toBeTruthy();
      expect(addFiles).not.toHaveBeenCalled();
      input.dispatchEvent(new Event('change'));
      expect(addFiles).toHaveBeenCalled();
    });

    it('assign to div', function() {
      var div = document.createElement('div');
      var addFiles = jasmine.createSpy('addFiles');
      resumable.addFiles = addFiles;
      resumable.assignBrowse(div);
      expect(div.children.length).toBe(1);
      var input = div.children[0];
      expect(addFiles).not.toHaveBeenCalled();
      input.dispatchEvent(new Event('change'));
      expect(addFiles).toHaveBeenCalled();
    });

    it('single file', function() {
      var input = document.createElement('input');
      input.type = 'file';
      resumable.assignBrowse(input, false, true);
      expect(input.hasAttribute('multiple')).toBeFalsy();
    });

    it('directory', function() {
      var input = document.createElement('input');
      input.type = 'file';
      resumable.assignBrowse(input, true);
      expect(input.hasAttribute('webkitdirectory')).toBeTruthy();
    });
  });

  describe('assignDrop', function() {
    it('assign to div', function() {
      var div = document.createElement('div');
      var addFiles = jasmine.createSpy('addFiles');
      resumable.addFiles = addFiles;
      resumable.assignDrop(div);
      var event = new Event('drop');
      event.dataTransfer = {files: []};
      div.dispatchEvent(event);
      expect(addFiles).toHaveBeenCalled();
      expect(addFiles.callCount).toBe(1);

      resumable.unAssignDrop(div);
      div.dispatchEvent(event);
      expect(addFiles.callCount).toBe(1);
    });
  });

});
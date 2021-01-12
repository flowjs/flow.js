describe('fileAdd event', function() {
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

  it('should call fileAdded event', function() {
    var valid = false;
    flow.on('fileAdded', function (file) {
      expect(file.file instanceof Blob).toBeTruthy();
      valid = true;
    });
    flow.addFile(new Blob(['file part']));
    expect(valid).toBeTruthy();
  });

  it('should call filesAdded event', function() {
    var count = 0;
    flow.on('filesAdded', function (files) {
      count = files.length;
    });
    flow.addFiles([
      new Blob(['file part']),
      new Blob(['file 2 part'])
    ]);
    expect(count).toBe(2);
    expect(flow.files.length).toBe(2);
  });

  it('fileAdded is deprecated as a hook', async function() {
    spyOn(console, 'warn');
    flow.on('fileAdded', function () {
      return false;
    });
    await flow.addFile(new Blob(['file part']));
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('should keeps file from being queued', function() {
    spyOn(console, 'warn');
    flow.on('preFilterFile', function () {
      return false;
    });
    flow.addFile(new Blob(['file part']));
    expect(flow.files.length).toBe(0);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should validate preFilterFile and filesAdded', function() {
    flow.on('preFilterFile', function () {
      return false;
    });
    var valid = false;
    flow.on('filesAdded', function (files) {
      valid = files.length === 0;
    });
    flow.addFile(new Blob(['file part']));
    expect(valid).toBeTruthy();
  });
});

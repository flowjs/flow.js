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
    var count2 = 0;
    flow.on('filesAdded', function (files, parsedFiles) {
      count = files.length;
      count2 = parsedFiles.length;
    });
    flow.addFiles([
      new File(['file part'], 'file1'),
      new File(['file 2 part'], 'file2')
    ]);
    expect(count).toBe(2);
    expect(count2).toBe(2);
    expect(flow.files.length).toBe(2);
    expect(flow.parsedFiles.length).toBe(2);
  });

  it('should validate fileAdded', function() {
    flow.on('fileAdded', function () {
      return false;
    });
    flow.addFile(new Blob(['file part']));
    expect(flow.files.length).toBe(0);
    expect(flow.parsedFiles.length).toBe(0);
  });

  it('should validate filesAdded', function() {
    flow.on('filesAdded', function () {
      return false;
    });
    flow.addFile(new Blob(['file part']));
    expect(flow.files.length).toBe(0);
    expect(flow.parsedFiles.length).toBe(0);
  });

  it('should validate fileAdded and filesAdded', function() {
    flow.on('fileAdded', function () {
      return false;
    });
    var valid = false;
    flow.on('filesAdded', function (files, parsedFiles) {
      valid = files.length === 0 && parsedFiles.length === 0;
    });
    flow.addFile(new Blob(['file part']));
    expect(valid).toBeTruthy();
  });
});
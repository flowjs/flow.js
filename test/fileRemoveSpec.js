describe('file-removed event', function() {
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

  it('should call file-removed event on Flow.removeFile', function() {
    var valid = false;
    var removedFile = null;
    flow.on('file-removed', ({detail: [file]}) => {
      expect(file.file instanceof Blob).toBeTruthy();
      removedFile = file;
      valid = true;
    });
    flow.addFile(new Blob(['file part']));
    var addedFile = flow.files[0];
    flow.removeFile(addedFile);
    expect(removedFile).toBe(addedFile);
    expect(valid).toBeTruthy();
  });
  
  it('should call file-removed event FlowFile.cancel', function() {
    var valid = false;
    var removedFile = null;
    flow.on('file-removed', ({detail: [file]}) => {
      expect(file.file instanceof Blob).toBeTruthy();
      removedFile = file;
      valid = true;
    });
    flow.addFile(new Blob(['file part']));
    var addedFile = flow.files[0];
    addedFile.cancel();
    expect(removedFile).toBe(addedFile);
    expect(valid).toBeTruthy();
  });  

});

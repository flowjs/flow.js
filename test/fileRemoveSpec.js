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

  it('should call file-removed event on Flow.removeFile', async function() {
    var valid = false;
    var removedFile = null;
    flow.on('file-removed', ({detail: [file]}) => {
      expect(file.file instanceof Blob).toBeTruthy();
      removedFile = file;
      valid = true;
    });
    await flow.addFile(new Blob(['file part']));
    var addedFile = flow.files[0];
    await flow.removeFile(addedFile);
    expect(removedFile).toBe(addedFile);
    expect(valid).toBeTruthy();
  });

  it('should call file-removed event FlowFile.cancel', async function() {
    var valid = false;
    var removedFile = null;
    flow.on('file-removed', ({detail: [file]}) => {
      expect(file.file instanceof Blob).toBeTruthy();
      removedFile = file;
      valid = true;
    });
    await flow.addFile(new Blob(['file part']));
    var addedFile = flow.files[0];
    await addedFile.cancel();
    expect(removedFile).toBe(addedFile);
    expect(valid).toBeTruthy();
  });
});
